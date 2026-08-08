const express = require("express");
const protect = require("../middlewares/userMiddleware");
const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getPaymentById,
  razorpayWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/webhook", razorpayWebhook);

router.use(protect);

router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/", getMyPayments);
router.get("/:id", getPaymentById);

module.exports = router;
