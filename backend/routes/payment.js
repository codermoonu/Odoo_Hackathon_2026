const express = require("express");
const protect = require("../middlewares/userMiddleware");
const {
  createOrder,
  verifyPayment,
  payWithWallet,
  getWalletBalanceHandler,
  getMyPayments,
  getPaymentById,
  razorpayWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/webhook", razorpayWebhook);

router.use(protect);

router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.post("/wallet", payWithWallet);
router.get("/wallet-balance", getWalletBalanceHandler);
router.get("/", getMyPayments);
// Must stay last — /:id would otherwise swallow literal paths above it.
router.get("/:id", getPaymentById);

module.exports = router;
