import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import Payment from "../../../models/Payment";
import Order from "../../../models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { invoice } = req.body;

  if (!invoice) {
    return res.status(400).json({ error: "Missing invoice" });
  }

  try {
    await dbConnect();

    // 1. Find and update checkout
    const checkout = await Checkout.findOneAndUpdate(
      { externalId: invoice },
      { status: "PAID" },
      { new: true }
    );

    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    // 2. Update payment record
    const payment = await Payment.findOneAndUpdate(
      { checkout: checkout._id },
      { status: "PAID", paidAt: new Date() },
      { new: true }
    );

    // 3. Update order status
    if (payment?.order) {
      await Order.findByIdAndUpdate(payment.order, { 
        status: "paid",
        paidAt: new Date()
      });
    } else {
      // Fallback: find order by orderNumber
      await Order.findOneAndUpdate(
        { orderNumber: invoice },
        { status: "paid", paidAt: new Date() }
      );
    }

    return res.status(200).json({ 
      success: true,
      message: "Order marked as paid",
      invoice
    });

  } catch (error: any) {
    console.error("Mark Paid Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}