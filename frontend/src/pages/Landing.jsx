import { Car, MapPin, Users, Leaf, ArrowRight } from "lucide-react";
import { useJourney } from "../context/JourneyContext";
import RoadBackground from "../components/RoadBackground";
import "./Landing.css";

function Landing() {
  const { hasStopped } = useJourney();
  const revealed = hasStopped;

  return (
    <div className="landing">
      <section className="landing-hero">
        <RoadBackground variant="hero" />
        <div className="landing-hero__fade" />

        <nav className={`landing-nav ${revealed ? "is-revealed" : ""}`}>
          <div className="landing-nav__brand">
            <span className="landing-nav__mark">
              <Car size={20} strokeWidth={2} />
            </span>
            <span className="landing-nav__name">CARPOOL</span>
          </div>

          <div className="landing-nav__links">
            <a href="#features" className="landing-nav__link">
              Home
            </a>
            <a href="#features" className="landing-nav__link">
              Cars
            </a>
            <a href="#features" className="landing-nav__link">
              My Bookings
            </a>
          </div>

          <div className="landing-nav__actions">
            <button type="button" className="landing-btn landing-btn--ghost">
              Login
            </button>
            <button type="button" className="landing-btn landing-btn--solid">
              Sign Up
            </button>
          </div>
        </nav>

        <div className={`landing-hero__content ${revealed ? "is-revealed" : ""}`}>
          <p className="landing-hero__eyebrow">Smart employee commuting</p>
          <h1 className="landing-hero__headline">
            Your daily commute,
            <span className="landing-hero__headline-accent"> shared &amp; simplified.</span>
          </h1>
          <p className="landing-hero__sub">
            Find coworkers travelling your way, share rides, save money and make
            your daily commute more sustainable &mdash; without slowing down.
          </p>

          <div className="landing-hero__ctas">
            <button type="button" className="landing-btn landing-btn--primary">
              <MapPin size={18} />
              Find a Ride
              <ArrowRight size={16} className="landing-btn__arrow" />
            </button>
            <button type="button" className="landing-btn landing-btn--secondary">
              <Car size={18} />
              Offer a Ride
            </button>
          </div>
        </div>

        {/* reserved visual space so layout never shifts once the car settles here */}
        <div className="landing-hero__car-slot" aria-hidden="true" />
      </section>

      <section id="features" className="landing-features">
        <div className="landing-features__grid">
          <Feature
            icon={<Users />}
            title="Share Rides"
            text="Connect with employees travelling along similar routes."
          />
          <Feature
            icon={<MapPin />}
            title="Smart Routes"
            text="Discover rides based on your pickup and destination."
          />
          <Feature
            icon={<Leaf />}
            title="Travel Sustainably"
            text="Reduce fuel consumption, traffic and environmental impact."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="landing-feature">
      <div className="landing-feature__icon">{icon}</div>
      <h3 className="landing-feature__title">{title}</h3>
      <p className="landing-feature__text">{text}</p>
    </div>
  );
}

export default Landing;
