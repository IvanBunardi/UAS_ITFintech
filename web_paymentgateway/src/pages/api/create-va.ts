// pages/api/create-va.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import Order from "../../../models/Order";
import { buildDokuHeaders } from "../../../lib/doku";

/**
 * Create Direct Virtual Account (BNI) via DOKU
 *
 * Requirements:
 * - env DOKU_CLIENT_ID
 * - env DOKU_SHARED_KEY (use Active Secret Key SK-xxxx)
 * - env DOKU_ENV (production or other)
 *
 * Example request body from frontend:
 * {
 *   "amount": 10000,
 *   "orderNumber": "ORD-...",
 *   "customer": { name, email, phone },
 *   "checkoutId": "<your checkout id>" // optional, for DB linking
 * }
 */
const DOKU_BASE =
  process.env.DOKU_ENV === "production"
    ? "https://api.doku.com"
    : "https://api-sandbox.doku.com";

const VA_PATH = "/virtual-account/v2/payment-code";
const VA_URL = `${DOKU_BASE}${VA_PATH}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();

  try {
    const { amount, orderNumber, customer, checkoutId } = req.body;

    if (!amount || !orderNumber || !customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: "Missing required fields: amount, orderNumber, customer(name,phone)" });
    }

    // Build request body for direct VA (BNI)
    const body = {
      order: {
        amount: Math.round(Number(amount)),
        invoice_number: orderNumber,
      },
      virtual_account_info: {
        // For BNI, using bank_code "BNI" (confirm with DOKU docs / your merchant onboarding)
        bank_code: "BNI",
        // merchant_unique_reference: optional unique ref on your side
        merchant_unique_reference: `VA-${orderNumber}-${Date.now()}`,
        // optional: expiry in minutes
        expires_in: 60 * 24, // e.g. 24 hours
      },
      customer: {
        name: customer.name,
        email: customer.email || "noemail@example.com",
        phone: customer.phone,
      },
      // Additional metadata / info you want saved — I'm including your uploaded file path per your request
      metadata: {
        // developer: local path from conversation (will be transformed to URL by your tooling if needed)
        fileUrl: "/mnt/data/71ff6191-d892-4c9a-a8d7-58a78ab1c135.png"
      }
    };

    // Build DOKU headers (make sure buildDokuHeaders uses the proper secret key SK-xxxx)
    const { headers, requestId } = buildDokuHeaders({
      requestTarget: VA_PATH,
      body,
    });

    // Call DOKU VA API
    const resp = await fetch(VA_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    let data: any;
    try {
      data = await resp.json();
    } catch (e) {
      const text = await resp.text();
      console.error("DOKU non-JSON response:", text);
      return res.status(502).json({ error: "Invalid response from DOKU", details: text });
    }

    // log DOKU full response for debugging
    console.log("=== DOKU VA RESPONSE ===");
    console.dir(data, { depth: 6 });

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "DOKU returned error",
        details: data,
      });
    }

    // Try to extract VA info (structure may vary by DOKU)
    const vaInfo =
      data.virtual_account_info ||
      data.payment?.virtual_account_info ||
      data.data?.virtual_account_info ||
      null;

    if (!vaInfo) {
      // no VA info returned — return full DOKU response for debugging
      return res.status(502).json({
        error: "DOKU did not return virtual_account_info",
        dokuResponse: data,
      });
    }

    // Save Payment record (optional)
    if (checkoutId) {
      try {
        await Payment.create({
          checkout: checkoutId,
          amount: body.order.amount,
          status: "PENDING",
          dokuId: requestId,
          dokuPayload: data,
          virtualAccount: vaInfo.virtual_account_number || null,
          bankCode: vaInfo.bank_code || "BNI",
        });
        // Also optionally update checkout / order status or attach VA
        await Checkout.findByIdAndUpdate(checkoutId, { invoiceUrl: vaInfo.how_to_pay_page || null, status: "PENDING" });
      } catch (dbErr) {
        console.warn("Failed to save payment record:", dbErr);
      }
    }

    // Return VA details to frontend
    return res.status(201).json({
      message: "Virtual account created",
      virtual_account_info: vaInfo,
      dokuResponse: data,
    });
  } catch (err: any) {
    console.error("ERROR create VA:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
