import { useEffect, useMemo, useState } from "react";
import { Wallet as WalletIcon, Plus, ReceiptText, CheckCircle2, Clock, XCircle } from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { FormField } from "../../components/ui/FormField";
import { useAuth } from "../../hooks/useAuth";
import { createOrder, verifyPayment, getMyPayments } from "../../services/payment";
import { PAYMENT_PURPOSE, RAZORPAY_CHECKOUT_SRC } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

const STATUS_ICON = { paid: CheckCircle2, created: Clock, failed: XCircle };
const STATUS_TONE = { paid: "success", created: "warning", failed: "danger" };

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the payment gateway"));
    document.body.appendChild(script);
  });
}

function Wallet() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("500");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  function loadPayments() {
    getMyPayments()
      .then(setPayments)
      .catch((err) => setError(err.message || "Could not load your transactions"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const balance = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid" && p.purpose === PAYMENT_PURPOSE.walletTopup)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments]
  );

  async function handleTopUp(e) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    setProcessing(true);
    try {
      const { order, keyId } = await createOrder({ amount: value, purpose: PAYMENT_PURPOSE.walletTopup });
      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "WAYFLOW",
        description: "Wallet top-up",
        theme: { color: "#7c3aed" },
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            loadPayments();
          } catch (err) {
            setError(err.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.message || "Could not start the top-up");
      setProcessing(false);
    }
  }

  return (
    <AppShell title="Wallet">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="bg-gradient-to-br from-violet-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-violet-100/80">
              <WalletIcon size={16} />
              Wallet balance
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{loading ? "—" : formatCurrency(balance)}</p>
          </div>

          <form onSubmit={handleTopUp} noValidate className="flex flex-col gap-4 p-6">
            {error && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <FormField
              label="Add money (₹)"
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex gap-2">
              {[200, 500, 1000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className="flex-1 cursor-pointer rounded-lg border border-border py-1.5 text-xs font-semibold text-text-dim transition-colors hover:border-violet-400/40 hover:text-text"
                >
                  ₹{v}
                </button>
              ))}
            </div>
            <Button type="submit" loading={processing} className="w-full justify-center">
              <Plus size={16} />
              Add money
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <ReceiptText size={17} className="text-violet-600" />
            <h2 className="font-display text-base font-bold">Transaction history</h2>
          </div>

          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-text-dim">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-text-dim">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {payments.map((p) => {
                const Icon = STATUS_ICON[p.status] || Clock;
                return (
                  <li key={p._id} className="flex items-center justify-between gap-3 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 text-text-dim">
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{p.purpose?.replace("_", " ")}</p>
                        <p className="text-xs text-text-faint">{formatDateTime(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={STATUS_TONE[p.status] || "neutral"}>{p.status}</Badge>
                      <p className="w-20 text-right text-sm font-semibold">{formatCurrency(p.amount, p.currency)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

export default Wallet;
