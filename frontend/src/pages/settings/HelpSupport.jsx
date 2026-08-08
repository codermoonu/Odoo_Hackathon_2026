import { useState } from "react";
import { SUPPORT_PHONE } from "../../utils/constants";
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronLeft,
  Car,
  CreditCard,
  ShieldCheck,
  User,
  MapPin,
  AlertCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

const CATEGORIES = [
  {
    icon: Car,
    title: "Rides & Bookings",
    text: "Problems with finding, booking or cancelling rides",
    steps: [
      { title: "Search your route", text: "Enter your pickup and destination on the Find a Ride screen." },
      { title: "Compare available rides", text: "Check the driver, timing and fare for each matching ride." },
      { title: "Request a seat", text: "Tap Request seat on the ride that works best for you." },
      { title: "Track confirmation", text: "The driver accepts or declines — watch My Trips for the status update." },
      { title: "Need to cancel?", text: "Open the trip from My Trips and cancel it before it starts." },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments",
    text: "Payment, refunds and transaction issues",
    steps: [
      { title: "Check your balance", text: "Open Wallet from the sidebar to see your current balance." },
      { title: "Top up if needed", text: "Add money using UPI, card or netbanking through Razorpay." },
      { title: "Fares are automatic", text: "Once a ride is confirmed, the fare per seat is deducted from your wallet." },
      { title: "Review your history", text: "Every top-up and fare charge appears in your Wallet's transaction list." },
      { title: "Refunds", text: "Cancelled or failed rides are refunded back to your wallet within a few minutes." },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Safety",
    text: "Report a safety concern or suspicious activity",
    steps: [
      { title: "Verify your ride", text: "Confirm the driver's name, vehicle and plate number match the app before boarding." },
      { title: "Share your trip", text: "Use Live Tracking to share your route with someone you trust." },
      { title: "Stay alert", text: "Trust your instincts — ask the driver to stop somewhere safe if anything feels wrong." },
      { title: "Report an issue", text: "Open the trip and select Report an Issue with details of what happened." },
      { title: "Emergency contact", text: "For anything urgent, use the Emergency Help button to reach support immediately." },
    ],
  },
  {
    icon: User,
    title: "Account",
    text: "Profile, password and account settings",
    steps: [
      { title: "Open Settings", text: "Tap Settings in the sidebar to manage your account." },
      { title: "Update your photo", text: "Tap your profile picture on the Settings page and choose a new image." },
      { title: "Edit your name", text: "Use Edit profile to update your display name." },
      { title: "Change your password", text: "Use the Change password section inside Edit profile." },
      { title: "Manage saved places", text: "Add or edit frequently used pickup and drop locations under Saved places." },
    ],
  },
];

const FAQS = [
  {
    question: "How do I book a ride?",
    answer:
      "Search for your destination from the home page, select a suitable ride and tap Book Ride. You can review the driver, pickup point and fare before confirming.",
  },
  {
    question: "Can I cancel a booked ride?",
    answer:
      "Yes. Open My Rides, select your booking and choose Cancel Ride. Any applicable cancellation charges will be displayed before you confirm.",
  },
  {
    question: "How do I report a driver?",
    answer:
      "Open the completed or active ride from My Rides and select Report an Issue. Choose the appropriate reason and provide details so our support team can investigate.",
  },
  {
    question: "What if my payment failed?",
    answer:
      "First check your internet connection and payment method. If money was deducted but your booking failed, wait a few minutes and check your transaction history before contacting support.",
  },
  {
    question: "How can I change my profile information?",
    answer: "Go to Settings → Edit profile. You can update your name, profile photo and password there.",
  },
];

function CategoryDetail({ category, feedback, onFeedback, onBack }) {
  const Icon = category.icon;
  return (
    <div className="animate-fade-up">
      <button
        onClick={onBack}
        className="mb-5 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-text-dim hover:text-text"
      >
        <ChevronLeft size={16} />
        All categories
      </button>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600/12 text-violet-700">
          <Icon size={26} />
        </div>
        <div>
          <h2 className="text-xl font-bold">{category.title}</h2>
          <p className="mt-0.5 text-sm text-text-faint">{category.text}</p>
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {category.steps.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-black/[0.02] p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-text-dim">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-black/[0.02] p-6 text-center">
        {feedback ? (
          <p className="font-medium text-emerald-700">
            Thanks for letting us know — glad we could {feedback === "up" ? "help!" : "try. We'll keep improving."}
          </p>
        ) : (
          <>
            <p className="font-medium">Was this helpful?</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => onFeedback("up")}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-700"
              >
                <ThumbsUp size={16} />
                Yes
              </button>
              <button
                onClick={() => onFeedback("down")}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-700"
              >
                <ThumbsDown size={16} />
                No
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HelpSupport() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [feedback, setFeedback] = useState({});

  const filteredFaqs = FAQS.filter((faq) => faq.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-bg text-text px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {activeCategory ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-surface p-6 shadow-[0_18px_40px_rgba(36,28,53,0.1)] sm:p-8">
            <CategoryDetail
              category={activeCategory}
              feedback={feedback[activeCategory.title]}
              onFeedback={(value) => setFeedback((f) => ({ ...f, [activeCategory.title]: value }))}
              onBack={() => setActiveCategory(null)}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20 ring-1 ring-violet-500/30">
                <HelpCircle className="h-8 w-8 text-violet-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">How can we help?</h1>
              <p className="mx-auto mt-3 max-w-xl text-text-dim">
                Find answers, troubleshoot problems or get in touch with the Wayflo support team.
              </p>
            </div>

            {/* Search */}
            <div className="mx-auto mb-12 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-faint" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for help..."
                  className="w-full rounded-2xl border border-border bg-black/[0.03] py-4 pl-14 pr-5 text-text outline-none backdrop-blur-xl transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Quick Support */}
            <div className="mb-12 grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setShowContact(true)}
                className="group rounded-2xl border border-violet-500/20 bg-violet-600/10 p-6 text-left transition hover:-translate-y-1 hover:border-violet-500/50 hover:bg-violet-600/20"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Contact Support</h3>
                <p className="mt-2 text-sm text-text-dim">Tell us what went wrong and we'll help you out.</p>
              </button>
              <a
                href="mailto:support@wayflo.app"
                className="group rounded-2xl border border-border bg-black/[0.02] p-6 transition hover:-translate-y-1 hover:border-border-strong hover:bg-black/[0.04]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black/5">
                  <Mail className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold">Email Us</h3>
                <p className="mt-2 text-sm text-text-dim">Get help from our support team via email.</p>
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="group rounded-2xl border border-border bg-black/[0.02] p-6 transition hover:-translate-y-1 hover:border-border-strong hover:bg-black/[0.04]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black/5">
                  <Phone className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold">Emergency Help</h3>
                <p className="mt-2 text-sm text-text-dim">Need urgent assistance during a ride?</p>
              </a>
            </div>

            {/* Categories */}
            <section className="mb-12">
              <div className="mb-5">
                <h2 className="text-2xl font-bold">What do you need help with?</h2>
                <p className="mt-1 text-sm text-text-faint">Choose a category to find relevant solutions.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.title}
                      onClick={() => setActiveCategory(category)}
                      className="group rounded-2xl border border-border bg-black/[0.02] p-5 text-left transition hover:-translate-y-1 hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
                    >
                      <Icon className="mb-5 h-6 w-6 text-violet-600 transition group-hover:scale-110" />
                      <h3 className="font-semibold">{category.title}</h3>
                      <p className="mt-2 text-sm leading-5 text-text-faint">{category.text}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* FAQ */}
            <section className="mx-auto max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                <p className="mt-1 text-sm text-text-faint">Quick answers to common Wayflo questions.</p>
              </div>
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div key={faq.question} className="overflow-hidden rounded-2xl border border-border bg-black/[0.02]">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="flex w-full items-center justify-between gap-4 p-5 text-left"
                        >
                          <span className="font-medium">{faq.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 shrink-0 text-text-faint transition-transform ${
                              isOpen ? "rotate-180 text-violet-600" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-border px-5 pb-5 pt-4 text-sm leading-6 text-text-dim">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-border p-10 text-center">
                    <AlertCircle className="mx-auto mb-3 h-8 w-8 text-text-faint" />
                    <p className="text-text-dim">No articles found for "{search}"</p>
                  </div>
                )}
              </div>
            </section>

            {/* Bottom CTA */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-600/20 to-purple-600/5 p-8 text-center">
              <MapPin className="mx-auto mb-4 h-7 w-7 text-violet-600" />
              <h2 className="text-2xl font-bold">Still need help?</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-text-dim">
                Our support team is here to make your Wayflo experience smooth and safe.
              </p>
              <button
                onClick={() => setShowContact(true)}
                className="mt-6 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-600/20"
              >
                Talk to Support
              </button>
            </div>
          </>
        )}
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setShowContact(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Contact Support</h2>
                <p className="mt-1 text-sm text-text-faint">We'll get back to you as soon as possible.</p>
              </div>
              <button
                onClick={() => setShowContact(false)}
                className="rounded-lg px-3 py-2 text-text-dim hover:bg-black/5 hover:text-text"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Your support request has been submitted!");
                setShowContact(false);
              }}
              className="space-y-4"
            >
              <input
                required
                type="text"
                placeholder="Your name"
                className="w-full rounded-xl border border-border bg-black/[0.03] px-4 py-3 outline-none focus:border-violet-500"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-border bg-black/[0.03] px-4 py-3 outline-none focus:border-violet-500"
              />
              <select
                required
                className="w-full rounded-xl border border-border bg-black/[0.03] px-4 py-3 text-text-dim outline-none focus:border-violet-500"
              >
                <option value="">Select an issue</option>
                <option>Ride / Booking</option>
                <option>Payment</option>
                <option>Account</option>
                <option>Safety</option>
                <option>Other</option>
              </select>
              <textarea
                required
                rows="4"
                placeholder="Describe your issue..."
                className="w-full resize-none rounded-xl border border-border bg-black/[0.03] px-4 py-3 outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-500"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpSupport;
