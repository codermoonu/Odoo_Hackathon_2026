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

          <Link to="/" className="brand-link">

            <span className="brand-logo-box">

              <img
                src={assets.logo}
                alt="Wayflow"
                className="brand-logo"
              />

            </span>

            <span className="brand-name">
              WAYFLOW
            </span>

          </Link>


          {/* DESKTOP NAVIGATION */}

          <div className="desktop-navigation">

            <a href="#features">
              Features
            </a>

            <a href="#how-it-works">
              How it works
            </a>

            <a href="#testimonials">
              Stories
            </a>

          </div>


          {/* DESKTOP ACTIONS */}

          <div className="desktop-actions">

            <Link
              to="/login"
              className="login-link"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="signup-button"
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

        </nav>


        {/* =========================
            MOBILE MENU
        ========================= */}

        {menuOpen && (

          <div className="mobile-menu">

            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>

            <a
              href="#testimonials"
              onClick={() => setMenuOpen(false)}
            >
              Stories
            </a>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className="mobile-signup"
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


          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="hero-copy">

            <span className="hero-eyebrow">
              SMARTER COMMUTES. BETTER TOGETHER.
            </span>


            <h1>

              Your daily commute,

              <br />

              <span>
                shared &amp; simplified.
              </span>

            </h1>


            <p className="hero-description">

              Find coworkers travelling your way,
              share rides, save money and make your
              daily commute more sustainable —
              without slowing down.

            </p>


            {/* CTA BUTTONS */}

            <div className="hero-buttons">

              <Link
                to="/signup"
                className="primary-cta"
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
                className="secondary-cta"
              >

                <Car size={19} />

                Offer a Ride

              </Link>

            </div>


            {/* TRUST */}

            <div className="hero-trust">

              <span>

                <ShieldCheck size={18} />

                Org-verified riders

              </span>


              <span>

                <Wallet size={18} />

                Simple fare splitting

              </span>

            </div>

          </div>


          {/* =================================================
              CAR
          ================================================= */}

          <div
            className="hero-car-area"
            aria-hidden="true"
          >

            {/* Purple glow */}

            <div className="car-light" />


            {/* Moving road */}

            <div className="hero-road">

              <div className="road-line road-line-1" />

              <div className="road-line road-line-2" />

              <div className="road-line road-line-3" />

              <div className="road-line road-line-4" />

              <div className="road-line road-line-5" />

              <div className="road-line road-line-6" />

            </div>


            {/* CAR */}

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

            <span>
              WHY WAYFLOW
            </span>

            <h2>
              Built for the daily commute.
            </h2>

            <p>
              Everything your team needs to turn solo
              drives into convenient shared rides.
            </p>

          </div>


          <div className="features-grid">

            {FEATURES.map(
              ({ icon: Icon, title, text }) => (

                <div
                  key={title}
                  className="feature-card"
                >

                  <div className="feature-icon">

                    <Icon size={25} />

                  </div>


                  <h3>
                    {title}
                  </h3>


                  <p>
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

            <span>
              SIMPLE BY DESIGN
            </span>

            <h2>
              How it works
            </h2>

          </div>


          <div className="steps-grid">

            {STEPS.map(
              (step, index) => (

                <div
                  key={step.title}
                  className="step-card"
                >

                  <div className="step-number">

                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <h3>
                    {step.title}
                  </h3>


                  <p>
                    {step.text}
                  </p>

                </div>

              )
            )}

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

            <span>
              COMMUNITY
            </span>

            <h2>
              Loved by commuters.
            </h2>

          </div>


          <div className="testimonials-grid">

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


                  <p className="testimonial-quote">

                    “{testimonial.quote}”

                  </p>


                  <div className="testimonial-user">

                    <img
                      src={testimonial.image}
                      alt=""
                    />


                    <div>

                      <p>
                        {testimonial.name}
                      </p>

                      <span>
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

            <h2>
              Ready to share your ride?
            </h2>

            <p>
              Join your organization's carpool
              network today. Your next commute
              could be a shared one.
            </p>


            <Link
              to="/signup"
              className="cta-button"
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


            <span>
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


          <p>
            © {new Date().getFullYear()} Wayflow
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Landing;