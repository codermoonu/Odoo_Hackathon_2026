import { Link } from "react-router-dom";
import {
  Car,
  MapPin,
  Users,
  Leaf,
  ArrowRight,
  Wallet,
  ShieldCheck,
  Star,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { assets } from "../assets/assets";

const FEATURES = [
  {
    icon: Users,
    title: "Share Rides",
    text: "Connect with coworkers travelling along similar routes, every day.",
  },
  {
    icon: MapPin,
    title: "Smart Matching",
    text: "Discover rides based on your pickup, destination and schedule.",
  },
  {
    icon: Leaf,
    title: "Travel Sustainably",
    text: "Cut fuel costs, traffic and your commute's environmental impact.",
  },
];

const STEPS = [
  { title: "Sign up with your work email", text: "Join your organization's carpool network in seconds." },
  { title: "Find or offer a ride", text: "Search rides going your way, or publish your own route and seats." },
  { title: "Ride, split the fare, repeat", text: "Track your trip, pay seamlessly from your wallet, and do it again tomorrow." },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Product Designer",
    image: assets.testimonial_image_1,
    quote: "I've cut my commute cost in half and made three new friends on my floor. It just works.",
  },
  {
    name: "Arjun Mehta",
    role: "Backend Engineer",
    image: assets.testimonial_image_2,
    quote: "Offering a ride takes under a minute. The route + fare estimate is spot on every time.",
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh w-full bg-bg text-text">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-[-10%] left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="absolute right-[-6rem] bottom-[-8rem] h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]"
        />

        <nav className="relative z-20 flex items-center justify-between gap-4 px-5 py-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2.5">
            <img src={assets.logo} alt="" className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-wide">CARPOOL</span>
          </div>

          <div className="hidden items-center gap-9 md:flex">
            <a href="#features" className="text-sm font-medium text-text-dim transition-colors hover:text-text">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-text-dim transition-colors hover:text-text">
              How it works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-text-dim transition-colors hover:text-text">
              Stories
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-text-dim transition-colors hover:text-text"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.35)] transition-transform hover:-translate-y-0.5"
            >
              Sign up free
            </Link>
          </div>

          <button
            className="rounded-lg p-2 text-text-dim hover:bg-white/5 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="relative z-20 mx-5 mb-4 flex flex-col gap-1 rounded-2xl border border-border bg-surface p-3 md:hidden">
            <a href="#features" className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/5" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/5" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <Link to="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-dim hover:bg-white/5">
              Log in
            </Link>
            <Link to="/signup" className="mt-1 rounded-lg bg-violet-600 px-3 py-2.5 text-center text-sm font-semibold text-white">
              Sign up free
            </Link>
          </div>
        )}

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pt-8 pb-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:pt-16 lg:pb-32">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-300 uppercase">
              Smart employee commuting
            </p>
            <h1 className="font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Your daily commute,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                shared &amp; simplified.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-dim sm:text-lg">
              Find coworkers travelling your way, share rides, save money and make
              your daily commute more sustainable — without slowing down.
            </p>

            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(124,58,237,0.55)]"
              >
                <MapPin size={18} />
                Find a Ride
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-text backdrop-blur transition-colors hover:border-violet-400/40 hover:bg-white/10"
              >
                <Car size={18} />
                Offer a Ride
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-text-faint">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-violet-400" /> Org-verified riders
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet size={16} className="text-violet-400" /> In-app fare split
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br from-violet-600/25 to-purple-500/10 blur-2xl"
            />
            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface/60 p-8 shadow-[0_30px_70px_rgba(6,4,16,0.55)] backdrop-blur">
              <img src={assets.main_car} alt="" className="w-full drop-shadow-[0_20px_40px_rgba(124,58,237,0.35)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="relative border-t border-border bg-bg-alt px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">Built for the daily commute</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-text-dim sm:text-base">
            Everything your team needs to turn solo drives into shared rides.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-surface p-7 transition-transform duration-300 hover:-translate-y-1.5 hover:border-violet-400/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="border-t border-border px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative pl-1">
                <span className="font-display text-4xl font-extrabold text-violet-500/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section id="testimonials" className="border-t border-border bg-bg-alt px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">Loved by commuters</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-surface p-7">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-text-dim">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={t.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-text">{t.name}</p>
                    <p className="text-xs text-text-faint">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="border-t border-border px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/15 to-purple-500/5 px-8 py-14 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to share your ride?</h2>
          <p className="max-w-md text-sm text-text-dim sm:text-base">
            Join your organization's carpool network today — it takes less than a minute.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.4)] transition-transform hover:-translate-y-0.5"
          >
            Get started
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <img src={assets.logo} alt="" className="h-7 w-7" />
            <span className="font-display text-sm font-bold tracking-wide">CARPOOL</span>
          </div>
          <div className="flex items-center gap-5">
            <img src={assets.gmail_logo} alt="Email" className="h-5 w-5 opacity-60 transition-opacity hover:opacity-100" />
            <img src={assets.facebook_logo} alt="Facebook" className="h-5 w-5 opacity-60 transition-opacity hover:opacity-100" />
            <img src={assets.instagram_logo} alt="Instagram" className="h-5 w-5 opacity-60 transition-opacity hover:opacity-100" />
            <img src={assets.twitter_logo} alt="Twitter" className="h-5 w-5 opacity-60 transition-opacity hover:opacity-100" />
          </div>
          <p className="text-xs text-text-faint">© {new Date().getFullYear()} CARPOOL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
