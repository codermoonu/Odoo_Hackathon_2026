import api from "./api";

export function createOrder({ amount, currency, purpose, tripId, notes }) {
  return api.post("/payments/order", { amount, currency, purpose, tripId, notes }).then((res) => res.data);
}

export function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  return api
    .post("/payments/verify", { razorpay_order_id, razorpay_payment_id, razorpay_signature })
    .then((res) => res.data);
}

export function getMyPayments() {
  return api.get("/payments").then((res) => res.data);
}

export function getPaymentById(id) {
  return api.get(`/payments/${id}`).then((res) => res.data);
}
