// pages/api/webhook/doku.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import Order from "../../../models/Order";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Read raw body
const getRawBody = (req: NextApiRequest): Promise<string> => {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔥 DOKU WEBHOOK RECEIVED");

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const rawBody = await getRawBody(req);
  console.log("RAW BODY:", rawBody);

  const signatureHeader = req.headers["signature"] as string;
  const clientId = req.headers["client-id"] as string;
  const requestId = req.headers["request-id"] as string;
  const requestTimestamp = req.headers["request-timestamp"] as string;
  const requestTarget = req.headers["request-target"] as string; // << WAJIB PAKAI INI!

  if (!signatureHeader || !clientId || !requestId || !requestTimestamp) {
    console.log("❌ Missing signature headers");
    return res.status(400).json({ error: "Missing signature headers" });
  }

  // === SIGNATURE CHECK ===
  const digest = crypto
    .createHash("sha256")
    .update(rawBody)
    .digest("base64");

  const signatureString =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digest}`;

  const expectedSignature =
    "HMACSHA256=" +
    crypto
      .createHmac("sha256", process.env.DOKU_SECRET_KEY!) // MUST USE SECRET KEY!
      .update(signatureString)
      .digest("base64");

  console.log("Header Sig:", signatureHeader);
  console.log("Calc Sig  :", expectedSignature);

  if (expectedSignature !== signatureHeader) {
    console.log("❌ INVALID SIGNATURE");
    return res.status(403).json({ error: "Invalid signature" });
  }

  console.log("✅ SIGNATURE VALID");

  // === Parse JSON ===
  const json = JSON.parse(rawBody);
  console.log("WEBHOOK JSON:", json);

  await dbConnect();

  const invoice = json?.order?.invoice_number;
  const status = json?.transaction?.status;

  // === UPDATE PAYMENT ===
  if (status === "SUCCESS") {
    console.log("💰 Payment success for invoice:", invoice);

    const checkout = await Checkout.findOneAndUpdate(
      { externalId: invoice },
      { status: "PAID" }
    );

    const payment = await Payment.findOneAndUpdate(
      { checkout: checkout?._id },
      { status: "PAID" },
      { upsert: true }
    );

    if (payment?.order) {
      await Order.findByIdAndUpdate(payment.order, { status: "paid" });
    }

    return res.status(200).json({ received: true });
  }

  if (status === "EXPIRED") {
    console.log("⌛ Payment expired:", invoice);

    const checkout = await Checkout.findOneAndUpdate(
      { externalId: invoice },
      { status: "EXPIRED" }
    );

    if (checkout) {
      const payment = await Payment.findOne({ checkout: checkout._id });
      if (payment?.order) {
        await Order.findByIdAndUpdate(payment.order, { status: "cancelled" });
      }
    }

    return res.status(200).json({ received: true });
  }

  console.log("⚠ Unhandled status:", status);
  return res.status(200).json({ received: true });
}
