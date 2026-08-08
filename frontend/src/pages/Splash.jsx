import { useEffect, useState } from "react";
import { assets } from "../assets/assets";

function Splash({ onComplete }) {
  const [phase, setPhase] = useState("start");

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPhase("driving");
    }, 300);

    const finishTimer = setTimeout(() => {
      setPhase("finish");

      const completeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 650);

      return () => clearTimeout(completeTimer);
    }, 3900);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`splash-screen ${
        phase === "finish" ? "splash-finish" : ""
      }`}
    >
      {/* Very soft background decoration */}
      <div className="splash-bg-glow splash-bg-glow-one" />
      <div className="splash-bg-glow splash-bg-glow-two" />

      <div className="splash-content">

        {/* LOGO */}
        <div className="splash-logo-section">

          <div className="splash-logo-box">
            <img
              src={assets.logo}
              alt="Wayflow logo"
              className="splash-logo"
            />
          </div>

          <h1 className="splash-brand">
            WAYFLOW
          </h1>

          <p className="splash-tagline">
            Your journey, shared.
          </p>

        </div>


        {/* ROAD / LOADING BAR */}
        <div className="splash-road-wrapper">

          {/* Car */}
          <div
            className={`splash-car ${
              phase === "start"
                ? "car-start"
                : phase === "driving"
                ? "car-driving"
                : "car-finish"
            }`}
          >
           <img
  src={assets.main_car}
  alt="Wayflow car"
  className="splash-car-image scale-x-[-1]"
/>
          </div>


          {/* Road */}
          <div className="splash-road">

            {/* Loading progress */}
            <div
              className={`splash-road-progress ${
                phase === "driving" ? "progress-driving" : ""
              }`}
            />

            {/* Road markings */}
            <div className="road-markings">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

          </div>

        </div>


        {/* MESSAGE */}
        <div className="splash-message">

          <span className="message-dot" />

          <span>
            Making every commute better
          </span>

        </div>

      </div>
    </div>
  );
}

export default Splash;