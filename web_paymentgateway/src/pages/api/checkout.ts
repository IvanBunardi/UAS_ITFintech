import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Order from "../../../models/Order";
import Payment from "../../../models/Payment";

const DOKU_BASE = "https://api.doku.com";
const DOKU_PATH = "/checkout/v2/payment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const {
      items,
      totalPrice,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = req.body;

    console.log("ITEMS RECEIVED:", items);

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Items tidak boleh kosong" });
    }

    const CLIENT_ID = process.env.DOKU_CLIENT_ID!;
    const SECRET_KEY = process.env.DOKU_SECRET_KEY!;

    // === Generate invoice ===
    const invoice_number = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // ====================================
    // 1. SAVE CHECKOUT (FIXED)
    // ====================================
    const checkout = await Checkout.create({
      externalId: invoice_number,
      items: items.map((i: any) => ({
        product: i._id || i.productId || i.id,
        qty: i.qty || i.quantity || 1,
        price: i.price,
      })),
      totalPrice: Math.round(totalPrice),
      status: "PENDING",
      customerName,
      customerEmail: customerEmail || "noemail@example.com",
      customerWhatsapp: customerPhone,
    });

    // ====================================
    // 2. SAVE ORDER (FIXED)
    // ====================================
    const order = await Order.create({
      orderNumber: invoice_number,
      customerName,
      customerPhone,
      customerEmail,
      totalAmount: Math.round(totalPrice),
      status: "waiting_payment",
      notes: notes || "",
      items: items.map((i: any) => ({
        productId: i._id || i.productId || i.id,
        name: i.name,
        category: i.category || "",
        price: i.price,
        quantity: i.qty || i.quantity || 1,
        imageUrl: i.imageUrl || "",
      })),
    });

    // ====================================
    // 3. DOKU BODY
    // ====================================
    const body = {
      order: {
        amount: Math.round(totalPrice),
        invoice_number,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
      },
      payment: {
        payment_due_date: 60, // minutes
      },
      customer: {
        name: customerName,
        email: customerEmail || "noemail@example.com",
        phone: customerPhone,
      },
    };

    // ====================================
    // 4. SIGNATURE (WORKING)
    // ====================================
    const requestId = crypto.randomUUID();
    const requestTs = new Date().toISOString();

    const digest = crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("base64");

    const rawSignature =
      `Client-Id:${CLIENT_ID}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTs}\n` +
      `Request-Target:${DOKU_PATH}\n` +
      `Digest:${digest}`;

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(rawSignature)
      .digest("base64");

    const headers = {
      "Content-Type": "application/json",
      "Client-Id": CLIENT_ID,
      "Request-Id": requestId,
      "Request-Timestamp": requestTs,
      Signature: `HMACSHA256=${signature}`,
    };

    console.log("=== DOKU REQUEST BODY ===");
    console.log(JSON.stringify(body, null, 2));

    // ====================================
    // 5. REQUEST KE DOKU
    // ====================================
    const resp = await fetch(`${DOKU_BASE}${DOKU_PATH}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await resp.json();
    console.log("=== DOKU RESPONSE ===");
    console.dir(data, { depth: 10 });

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "Gagal membuat pembayaran di DOKU",
        details: data,
      });
    }

    const checkoutUrl =
      data?.response?.payment?.url ||
      data?.checkout_url ||
      data?.payment?.url;

    if (!checkoutUrl) {
      return res.status(500).json({
        error: "DOKU tidak mengembalikan checkout_url",
        doku: data,
      });
    }

    // ====================================
    // 6. SAVE PAYMENT LOG
    // ====================================
    await Payment.create({
      checkout: checkout._id,
      order: order._id,
      amount: Math.round(totalPrice),
      dokuPayload: data,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      checkoutUrl,
      orderId: order._id,
      invoiceNumber: invoice_number,
    });

  } catch (err: any) {
    console.error("CHECKOUT ERROR:", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}
