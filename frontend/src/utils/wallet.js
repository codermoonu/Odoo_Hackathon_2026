import { PAYMENT_PURPOSE } from "./constants";

// Wallet balance = paid top-ups minus everything ever paid *from* the
// wallet (method: "wallet") — keep this in sync with the same formula in
// backend/controllers/paymentController.js's getWalletBalance().
export function computeWalletBalance(payments) {
  const paid = payments.filter((p) => p.status === "paid");
  const topUps = paid
    .filter((p) => p.purpose === PAYMENT_PURPOSE.walletTopup)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const spent = paid.filter((p) => p.method === "wallet").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return topUps - spent;
}
