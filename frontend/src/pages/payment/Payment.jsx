import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock3,
  User,
  Car,
  AlertCircle,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import MapView from "../../components/map/MapView";
import { useAuth } from "../../hooks/useAuth";
import { getTripById } from "../../services/trip";
import { createOrder, verifyPayment } from "../../services/payment";
import { PAYMENT_PURPOSE, RAZORPAY_CHECKOUT_SRC } from "../../utils/constants";
import { formatCurrency, formatDateTime } from "../../utils/formatDate";

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

function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let active = true;
    getTripById(id)
      .then((data) => {
        if (active) setTrip(data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Could not load this ride");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handlePay() {
    if (!trip) return;
    setPayError("");
    setProcessing(true);
    try {
      const { order, keyId } = await createOrder({
        amount: trip.fare_per_seat,
        purpose: PAYMENT_PURPOSE.tripFare,
        tripId: trip._id,
        notes: { trip_id: trip.trip_id, route: `${trip.start_address} -> ${trip.dest_address}` },
      });
      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "WAYFLOW",
        description: `Fare for ${trip.start_address} → ${trip.dest_address}`,
        theme: { color: "#7c3aed" },
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaid(true);
          } catch (err) {
            setPayError(err.message || "Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      razorpay.on("payment.failed", () => {
        setPayError("Payment failed. Please try again.");
        setProcessing(false);
      });
      razorpay.open();
    } catch (err) {
      setPayError(err.message || "Could not start the payment");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Pay for ride">
        <Card className="h-64 animate-pulse" />
      </AppShell>
    );
  }

  if (loadError || !trip) {
    return (
      <AppShell title="Pay for ride">
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError || "This ride could not be found."}</p>
          <Link to="/rides/available" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Back to rides
          </Link>
        </Card>
      </AppShell>
    );
  }

  if (paid) {
    return (
      <AppShell title="Pay for ride">
        <Card className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-700">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payment successful</h2>
            <p className="mt-1.5 text-sm text-text-dim">
              You've paid {formatCurrency(trip.fare_per_seat)} for your seat from {trip.start_address} to{" "}
              {trip.dest_address}.
            </p>
          </div>
          <div className="mt-2 flex w-full flex-col gap-2.5 sm:flex-row">
            <Button variant="secondary" className="flex-1 justify-center" onClick={() => navigate("/rides/available")}>
              Back to rides
            </Button>
            <Button className="flex-1 justify-center" onClick={() => navigate(`/trips/${trip.trip_id}/live`)}>
              Track this ride
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Pay for ride">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                  <MapPin size={14} className="shrink-0 text-violet-600" />
                  {trip.start_address}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-semibold">
                  <ArrowRight size={14} className="shrink-0 text-text-faint" />
                  {trip.dest_address}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-text-faint">
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {trip.driver_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Car size={13} />
                {trip.vehicle}
              </span>
              {trip.duration_mins != null && (
                <span className="flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {Math.round(trip.duration_mins)} min
                </span>
              )}
              <span>{formatDateTime(trip.createdAt)}</span>
            </div>
          </Card>

          <Card className="h-72 overflow-hidden p-0 lg:h-80">
            <MapView pickup={trip.start_coords} destination={trip.dest_coords} showSummary />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-sm font-medium text-text-dim">Fare per seat</p>
              <p className="mt-1 font-display text-3xl font-bold">{formatCurrency(trip.fare_per_seat)}</p>
            </div>

            {payError && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {payError}
              </div>
            )}

            <Button loading={processing} className="w-full justify-center" onClick={handlePay}>
              <CreditCard size={16} />
              Pay {formatCurrency(trip.fare_per_seat)}
            </Button>

            <p className="flex items-center gap-1.5 text-xs text-text-faint">
              <ShieldCheck size={13} />
              Secured by Razorpay. Your seat is confirmed once payment succeeds.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default Payment;
