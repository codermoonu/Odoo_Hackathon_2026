
import { Link, useNavigate } from "react-router-dom";
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
import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { useAuth } from "../hooks/useAuth";

const FEATURES = [
  {
    icon: Users,
    title: "Share Rides",
    text: "Connect with coworkers travelling along similar routes and make every commute easier.",
  },
  {
    icon: MapPin,
    title: "Smart Matching",
    text: "Find rides based on your pickup, destination and daily schedule.",
  },
  {
    icon: Leaf,
    title: "Travel Sustainably",
    text: "Reduce fuel costs, traffic and your everyday environmental impact.",
  },
];

const STEPS = [
  {
    title: "Create your profile",
    text: "Join your organization's carpool network with your work email.",
  },
  {
    title: "Find or offer a ride",
    text: "Choose a ride going your way or publish your own route.",
  },
  {
    title: "Ride & split",
    text: "Travel together, split the fare and make your commute simpler.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Product Designer",
    image: assets.testimonial_image_1,
    quote:
      "I've cut my commute cost in half and made three new friends on my floor. It just works.",
  },
  {
    name: "Arjun Mehta",
    role: "Backend Engineer",
    image: assets.testimonial_image_2,
    quote:
      "Offering a ride takes under a minute. The route and fare estimate are spot on every time.",
  },
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-section">

        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        {/* =========================
            NAVBAR
        ========================= */}

        <nav className="landing-nav">
          <div className="landing-nav-inner">

            <Link to="/" className="brand-link">

              <span className="brand-logo-box">

                <img
                  src={assets.logo}
                  alt="Wayflow"
                  className="brand-logo"
                />

              </span>

              <span className="brand-name font-display font-extrabold tracking-[0.12em]">
                WAYFLOW
              </span>

            </Link>

            {/* DESKTOP NAVIGATION */}

            <div className="desktop-navigation">

              <a
                href="#features"
                className="font-medium tracking-tight transition-all duration-200"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className="font-medium tracking-tight transition-all duration-200"
              >
                How it works
              </a>

              <a
                href="#testimonials"
                className="font-medium tracking-tight transition-all duration-200"
              >
                Stories
              </a>

            </div>

            {/* DESKTOP ACTIONS */}

            <div className="desktop-actions">

              <Link
                to="/login"
                className="login-link font-semibold tracking-tight transition-all duration-200"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="signup-button font-semibold tracking-tight"
              >
                Sign up free
              </Link>

            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              className="mobile-menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
            >

              {menuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}

            </button>

          </div>
        </nav>

        {/* =========================
            MOBILE MENU
        ========================= */}

        {menuOpen && (

          <div className="mobile-menu">

            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className="font-medium"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="font-medium"
            >
              How it works
            </a>

            <a
              href="#testimonials"
              onClick={() => setMenuOpen(false)}
              className="font-medium"
            >
              Stories
            </a>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="font-semibold"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="mobile-signup font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Sign up free
            </Link>

          </div>

        )}

        {/* =========================
            HERO CONTENT
        ========================= */}

        <div className="hero-content">

          {/* LEFT SIDE */}

          <div className="hero-copy">

            <span className="hero-eyebrow font-bold tracking-[0.18em]">
              SMARTER COMMUTES. BETTER TOGETHER.
            </span>

            <h1 className="font-display font-extrabold tracking-[-0.045em] leading-[1.02]">

              Your daily commute,

              <br />

              <span className="font-display">
                shared &amp; simplified.
              </span>

            </h1>

            <p className="hero-description text-[16px] sm:text-[17px] lg:text-[18px] leading-7 lg:leading-8 tracking-[-0.01em]">
              Find coworkers travelling your way,
              share rides, save money and make your
              daily commute more sustainable —
              without slowing down.
            </p>

            {/* CTA BUTTONS */}

            <div className="hero-buttons">

              <Link
                to="/signup"
                className="primary-cta font-bold tracking-[-0.01em]"
              >

                <MapPin size={19} />

                Find a Ride

                <ArrowRight
                  size={18}
                  className="cta-arrow"
                />

              </Link>

              <Link
                to="/signup"
                className="secondary-cta font-bold tracking-[-0.01em]"
              >

                <Car size={19} />

                Offer a Ride

              </Link>

            </div>

            {/* TRUST */}

            <div className="hero-trust">

              <span className="font-medium tracking-[-0.01em]">

                <ShieldCheck size={18} />

                Org-verified riders

              </span>

              <span className="font-medium tracking-[-0.01em]">

                <Wallet size={18} />

                Simple fare splitting

              </span>

            </div>

          </div>

          {/* CAR */}

          <div
            className="hero-car-area"
            aria-hidden="true"
          >

            <div className="car-light" />

            <div className="hero-road">

              <div className="road-line road-line-1" />
              <div className="road-line road-line-2" />
              <div className="road-line road-line-3" />
              <div className="road-line road-line-4" />
              <div className="road-line road-line-5" />
              <div className="road-line road-line-6" />

            </div>

            <div className="car-wrapper">

              <img
                src={assets.main_car}
                alt="Wayflow car"
                className="landing-car"
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="features-section"
      >

        <div className="section-container">

          <div className="section-heading">

            <span className="block mb-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#806cb0]">
              BUILT FOR EVERYDAY TRAVEL
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.04em] leading-[1.08] text-[#2b2340]">
              Built for the daily commute.
            </h2>

            <p className="mt-4 max-w-2xl text-base md:text-lg leading-7 md:leading-8 tracking-[-0.01em] text-[#716980]">
              Everything your team needs to turn solo
              drives into convenient shared rides.
            </p>

          </div>

          <div className="rounded-full features-grid">

            {FEATURES.map(
              ({ icon: Icon, title, text }) => (

                <div
                  key={title}
                  className="feature-card"
                >

                  <div className="feature-icon">

                    <Icon size={25} />

                  </div>

                  <h3 className="font-display text-lg md:text-xl font-bold tracking-[-0.02em] leading-tight text-[#2b2340]">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm md:text-[15px] leading-7 text-[#716980]">
                    {text}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="how-section"
      >

        <div className="section-container small-container">

          <div className="section-heading">

            <span className="block mb-3 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#806cb0]">
              SIMPLE BY DESIGN
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.04em] leading-[1.08] text-[#2b2340]">
              How it works
            </h2>

            <p className="mt-4 max-w-2xl text-base md:text-lg leading-7 md:leading-8 text-[#716980]">
              Three simple steps to make your everyday
              commute easier.
            </p>

          </div>

          <div className="steps-grid">

            {STEPS.map((step, index) => (

              <div
                key={step.title}
                className="step-card"
              >

                <div className="step-number-row">

                  <div className="step-number font-display font-extrabold tracking-[-0.05em]">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {index < STEPS.length - 1 && (
                    <div className="step-connector">
                      <span />
                    </div>
                  )}

                </div>

                <div className="step-content">

                  <span className="step-label font-bold tracking-[0.16em]">
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="font-display text-lg md:text-xl font-bold tracking-[-0.02em] leading-tight text-[#2b2340]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm md:text-[15px] leading-7 text-[#716980]">
                    {step.text}
                  </p>

                </div>

                <div className="step-route">

                  <span className="route-dot" />

                  <span className="route-line" />

                  <span className="route-dot" />

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          TESTIMONIALS
      ===================================================== */}

      <section
        id="testimonials"
        className="testimonials-section"
      >

        <div className="section-container small-container">

          <div className="section-heading">

            <span className="block text-center text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#806cb0]">
              COMMUNITY
            </span>

            <h2 className="mt-3 text-center font-display text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.04em] leading-tight text-[#2b2340]">
              Loved by everyday riders.
            </h2>

          </div>

          <div className="testimonials-grid rounded-2xl border border-border bg-surface-alt p-6 shadow-lg">

            {TESTIMONIALS.map(
              (testimonial) => (

                <div
                  key={testimonial.name}
                  className="testimonial-card"
                >

                  <div className="stars">

                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => (

                        <Star
                          key={index}
                          size={17}
                          fill="currentColor"
                          strokeWidth={0}
                        />

                      )
                    )}

                  </div>

                  <p className="testimonial-quote text-base md:text-[17px] leading-7 md:leading-8 tracking-[-0.01em]">
                    “{testimonial.quote}”
                  </p>

                  <div className="testimonial-user">

                    <img
                      src={testimonial.image}
                      alt=""
                    />

                    <div>

                      <p className="font-display text-sm font-bold tracking-[-0.01em] text-[#2b2340]">
                        {testimonial.name}
                      </p>

                      <span className="mt-1 block text-xs font-medium text-[#8b8498]">
                        {testimonial.role}
                      </span>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="cta-section">

        <div className="cta-box">

          <div className="cta-glow-one" />
          <div className="cta-glow-two" />

          <div className="cta-content">

            <h2 className="font-display font-extrabold tracking-[-0.04em] leading-tight">
              Ready to share your ride?
            </h2>

            <p className="text-base md:text-[17px] leading-7 md:leading-8 tracking-[-0.01em]">
              Join your organization's carpool
              network today. Your next commute
              could be a shared one.
            </p>

            <Link
              to="/signup"
              className="cta-button font-bold tracking-[-0.01em]"
            >

              Get started

              <ArrowRight size={18} />

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="footer-inner">

          <Link
            to="/"
            className="footer-brand"
          >

            <span className="footer-logo-box">

              <img
                src={assets.logo}
                alt="Wayflow"
              />

            </span>

            <span className="font-display font-extrabold tracking-[0.08em]">
              WAYFLOW
            </span>

          </Link>

          <div className="social-icons">

            <img
              src={assets.gmail_logo}
              alt="Email"
            />

            <img
              src={assets.facebook_logo}
              alt="Facebook"
            />

            <img
              src={assets.instagram_logo}
              alt="Instagram"
            />

            <img
              src={assets.twitter_logo}
              alt="Twitter"
            />

          </div>

          <p className="text-xs font-medium tracking-tight text-[#9891a8]">
            © {new Date().getFullYear()} Wayflow
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;

