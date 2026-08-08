import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  MapPin,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Wallet as WalletIcon,
  CheckCircle2,
  User,
  Car,
  Users,
  AlertCircle,
} from "lucide-react";
import AppShell from "../../components/ui/AppShell";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import MapView from "../../components/map/MapView";
import { useAuth } from "../../hooks/useAuth";
import { getBookingById } from "../../services/booking";
import { createOrder, verifyPayment, payWithWallet, getWalletBalance } from "../../services/payment";
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

function BookingPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  // The seat lock/booking already happened on Available Rides — this page
  // only exists to collect payment for a booking that's passed via router
  // state (not the URL), since the id in the URL is the ride, not the booking.
  const bookingId = location.state?.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [walletProcessing, setWalletProcessing] = useState(false);
  const [payError, setPayError] = useState("");
  const [paid, setPaid] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    let active = true;

    function bail() {
      setLoadError("Open this page from Available Rides to pay for a booking.");
      setLoading(false);
    }

    if (!bookingId) {
      bail();
      return;
    }
    getBookingById(bookingId)
      .then((data) => {
        if (active) setBooking(data);
      })
      .catch((err) => {
        if (active) setLoadError(err.message || "Could not load this booking");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    getWalletBalance()
      .then((balance) => {
        if (active) setWalletBalance(balance);
      })
      .catch(() => {
        // Wallet option just stays hidden if this fails — Razorpay still works.
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  async function handlePay() {
    if (!booking) return;
    setPayError("");
    setProcessing(true);
    try {
      const { order, keyId } = await createOrder({
        amount: booking.totalFare,
        purpose: PAYMENT_PURPOSE.tripFare,
        bookingId: booking._id,
        notes: { ride_id: booking.ride._id, route: `${booking.ride.pickupLocation} -> ${booking.ride.destination}` },
      });
      await loadRazorpayScript();

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "WAYFLOW",
        description: `Fare for ${booking.ride.pickupLocation} → ${booking.ride.destination}`,
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

  async function handleWalletPay() {
    if (!booking) return;
    setPayError("");
    setWalletProcessing(true);
    try {
      await payWithWallet({
        amount: booking.totalFare,
        purpose: PAYMENT_PURPOSE.tripFare,
        bookingId: booking._id,
        notes: { ride_id: booking.ride._id, route: `${booking.ride.pickupLocation} -> ${booking.ride.destination}` },
      });
      setPaid(true);
    } catch (err) {
      setPayError(err.message || "Could not pay with wallet");
    } finally {
      setWalletProcessing(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Pay for ride">
        <Card className="h-64 animate-pulse" />
      </AppShell>
    );
  }

  if (loadError || !booking) {
    return (
      <AppShell title="Pay for ride">
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle size={28} className="text-text-faint" />
          <p className="text-sm text-text-dim">{loadError || "This booking could not be found."}</p>
          <Link to="/rides/available" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            Back to rides
          </Link>
        </Card>
      </AppShell>
    );
  }

  const ride = booking.ride;
  const seatLabel = `${booking.seatsBooked} seat${booking.seatsBooked === 1 ? "" : "s"}`;

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
              You've paid {formatCurrency(booking.totalFare)} for {seatLabel} from {ride.pickupLocation} to{" "}
              {ride.destination}.
            </p>
          </div>
          <Button className="mt-2 w-full justify-center" onClick={() => navigate("/rides/available")}>
            Back to rides
          </Button>
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
                  {ride.pickupLocation}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 truncate text-sm font-semibold">
                  <ArrowRight size={14} className="shrink-0 text-text-faint" />
                  {ride.destination}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs text-text-faint">
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {ride.driver?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Car size={13} />
                {ride.vehicle ? `${ride.vehicle.make} ${ride.vehicle.model}` : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} />
                {seatLabel}
              </span>
              <span>
                {formatDateTime(ride.travelDate)} · {ride.travelTime}
              </span>
            </div>
          </Card>

          <Card className="h-72 overflow-hidden p-0 lg:h-80">
            <MapView
              pickup={{ lat: ride.pickupLat, lng: ride.pickupLng }}
              destination={{ lat: ride.destinationLat, lng: ride.destinationLng }}
              showSummary
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="flex flex-col gap-5 p-6">
            <div>
              <p className="text-sm font-medium text-text-dim">Total fare ({seatLabel})</p>
              <p className="mt-1 font-display text-3xl font-bold">{formatCurrency(booking.totalFare)}</p>
            </div>

            {payError && (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {payError}
              </div>
            )}

            <Button
              loading={processing}
              disabled={walletProcessing}
              className="w-full justify-center"
              onClick={handlePay}
            >
              <CreditCard size={16} />
              Pay with Razorpay
            </Button>

            {walletBalance != null && (
              <>
                <div className="flex items-center gap-3 text-xs text-text-faint">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="rounded-xl border border-border bg-black/[0.02] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-text-dim">
                      <WalletIcon size={14} className="text-violet-600" />
                      Wallet balance
                    </span>
                    <span className="font-semibold text-text">{formatCurrency(walletBalance)}</span>
                  </div>

                  <Button
                    variant="secondary"
                    loading={walletProcessing}
                    disabled={processing || walletBalance < booking.totalFare}
                    className="mt-3 w-full justify-center"
                    onClick={handleWalletPay}
                  >
                    <WalletIcon size={16} />
                    Pay with Wallet
                  </Button>

                  {walletBalance < booking.totalFare && (
                    <p className="mt-2 text-xs text-text-faint">
                      Insufficient balance —{" "}
                      <Link to="/wallet" className="font-semibold text-violet-600 hover:text-violet-700">
                        top up your wallet
                      </Link>{" "}
                      first.
                    </p>
                  )}
                </div>
              </>
            )}

            <p className="flex items-center gap-1.5 text-xs text-text-faint">
              <ShieldCheck size={13} />
              Your seat is already reserved — payment just confirms it.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default BookingPayment;
