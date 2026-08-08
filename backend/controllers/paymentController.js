const crypto = require("crypto");
const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");

// Razorpay SDK rejects with a plain { statusCode, error: { description } } object, not an Error.
const getErrorMessage = (error) => error?.error?.description || error?.message || "Something went wrong";

// Wallet balance = paid top-ups minus everything ever paid *from* the
// wallet (method: "wallet"), regardless of purpose. Top-ups always come in
// via Razorpay, so they never double as a wallet-method spend themselves.
const getWalletBalance = async (userId) => {
  const payments = await Payment.find({ user: userId, status: "paid" }).select("amount purpose method");
  const topUps = payments
    .filter((p) => p.purpose === "wallet_topup")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const spent = payments
    .filter((p) => p.method === "wallet")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return topUps - spent;
};

const createOrder = async (req, res) => {
  try {
    const { amount, currency, purpose, tripId, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "A positive amount is required" });
    }
    if (tripId && !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    // Razorpay caps `receipt` at 40 characters.
    const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: currency || "INR",
      receipt,
      notes: notes || {},
    });

    const payment = await Payment.create({
      user: req.user._id,
      trip: tripId || undefined,
      razorpayOrderId: order.id,
      amount: Number(amount),
      currency: order.currency,
      purpose: purpose || "other",
      notes: notes || {},
      status: "created",
    });

    res.status(201).json({
      order,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to verify this payment" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    res.status(200).json({ message: "Payment verified successfully", payment });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const payWithWallet = async (req, res) => {
  try {
    const { amount, purpose, tripId, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "A positive amount is required" });
    }
    if (tripId && !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const balance = await getWalletBalance(req.user._id);
    if (balance < Number(amount)) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const payment = await Payment.create({
      user: req.user._id,
      trip: tripId || undefined,
      method: "wallet",
      amount: Number(amount),
      currency: "INR",
      purpose: purpose || "other",
      notes: notes || {},
      status: "paid",
    });

    res.status(201).json({ payment, balance: balance - Number(amount) });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const getWalletBalanceHandler = async (req, res) => {
  try {
    const balance = await getWalletBalance(req.user._id);
    res.status(200).json({ balance });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access this payment" });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook.");
      return res.status(501).json({ message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const entity = req.body.payload?.payment?.entity;

    if (entity?.order_id) {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        if (event === "payment.captured") {
          payment.status = "paid";
          payment.razorpayPaymentId = entity.id;
          await payment.save();
        } else if (event === "payment.failed") {
          payment.status = "failed";
          payment.razorpayPaymentId = entity.id;
          await payment.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  payWithWallet,
  getWalletBalanceHandler,
  getMyPayments,
  getPaymentById,
  razorpayWebhook,
};
