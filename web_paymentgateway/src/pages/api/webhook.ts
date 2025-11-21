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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  console.log("RAW BODY:", rawBody);

  // Headers
  const signatureHeader = req.headers["signature"] as string;
  const clientId = req.headers["client-id"] as string;
  const requestId = req.headers["request-id"] as string;
  const requestTimestamp = req.headers["request-timestamp"] as string;
  const requestTarget = req.headers["request-target"] as string;

  console.log("request-target from DOKU:", requestTarget);

  if (!signatureHeader || !clientId || !requestId || !requestTimestamp || !requestTarget) {
    console.log("❌ Missing signature headers");
    return res.status(400).json({ error: "Missing signature headers" });
  }

  // === SIGNATURE VALIDATION ===
  const digest = crypto.createHash("sha256").update(rawBody).digest("base64");

  const signatureString =
    `Client-Id:${clientId}\n` +
    `Request-Id:${requestId}\n` +
    `Request-Timestamp:${requestTimestamp}\n` +
    `Request-Target:${requestTarget}\n` +
    `Digest:${digest}`;

  const expectedSignature =
    "HMACSHA256=" +
    crypto
      .createHmac("sha256", process.env.DOKU_SECRET_KEY!)
      .update(signatureString)
      .digest("base64");

  console.log("Header Sig:", signatureHeader);
  console.log("Calc Sig  :", expectedSignature);

  if (expectedSignature !== signatureHeader) {
    console.log("❌ INVALID SIGNATURE");
    return res.status(403).json({ error: "Invalid signature" });
  }

  console.log("✅ SIGNATURE VALID");

  // === PARSE JSON ===
  const json = JSON.parse(rawBody);
  console.log("WEBHOOK JSON:", json);

  await dbConnect();

  const invoice = json?.order?.invoice_number;
  const status = json?.transaction?.status;

  console.log("Invoice:", invoice);
  console.log("Payment Status:", status);

  if (!invoice) {
    console.log("❌ Invoice missing");
    return res.status(400).json({ error: "Missing invoice number" });
  }

  const checkout = await Checkout.findOne({ externalId: invoice });

  if (!checkout) {
    console.log("❌ Checkout not found for invoice:", invoice);
  }

  // ==============================================
  // SUCCESS, COMPLETED, PAID
  // ==============================================
  if (["SUCCESS", "COMPLETED", "PAID"].includes(status)) {
    console.log("💰 PAYMENT SUCCESS / COMPLETED / PAID");

    // update checkout
    const updatedCheckout = await Checkout.findOneAndUpdate(
      { externalId: invoice },
      { status: "PAID" },
      { new: true }
    );

    // update payment record
    const updatedPayment = await Payment.findOneAndUpdate(
      { checkout: updatedCheckout?._id },
      { status: "PAID", rawWebhook: json },
      { upsert: true, new: true }
    );

    console.log("Updated Payment:", updatedPayment);

    // fallback kalau payment.order kosong
    const orderId =
      updatedPayment?.order ||
      updatedCheckout?.order ||
      updatedPayment?.dokuPayload?.order?._id;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: "paid" });
      console.log("🎉 ORDER MARKED AS PAID:", orderId);
    } else {
      console.log("⚠ No order found for payment");
    }

    return res.status(200).json({ received: true });
  }

  // ==============================================
  // EXPIRED
  // ==============================================
  if (status === "EXPIRED") {
    console.log("⌛ PAYMENT EXPIRED");

    const updatedCheckout = await Checkout.findOneAndUpdate(
      { externalId: invoice },
      { status: "EXPIRED" },
      { new: true }
    );

    if (updatedCheckout) {
      const payment = await Payment.findOne({ checkout: updatedCheckout._id });
      if (payment?.order) {
        await Order.findByIdAndUpdate(payment.order, { status: "cancelled" });
      }
    }

    return res.status(200).json({ received: true });
  }

  console.log("⚠ Unhandled status:", status);
  return res.status(200).json({ received: true });
}
