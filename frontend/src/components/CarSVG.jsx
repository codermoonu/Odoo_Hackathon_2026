// Stylised side-profile hero car. Deliberately a clean vector silhouette
// (not a stock photo) so headlights, taillights and both wheels can be
// driven independently — wheel spin, headlight glow and body gloss are all
// real, controllable layers rather than baked into a raster image.
function CarSVG({ lit = false, className = "" }) {
  return (
    <svg
      className={`car-svg ${className}`}
      viewBox="0 0 640 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Illustration of a car"
    >
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a5468" />
          <stop offset="45%" stopColor="#1b1f29" />
          <stop offset="100%" stopColor="#05060a" />
        </linearGradient>
        <linearGradient id="carGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8e6ff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#141a26" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="carStripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="carHeadGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffdf2" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="carTailGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d4d" stopOpacity="1" />
          <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* contact shadow */}
      <ellipse cx="330" cy="214" rx="270" ry="14" fill="#000" opacity="0.45" />

      {/* body */}
      <path
        d="M50,188 C40,188 34,178 38,166 C42,150 55,150 72,147
           C96,109 122,94 166,85 C186,59 216,41 256,37
           C300,29 360,29 405,37 C445,43 470,57 490,79
           C505,94 515,99 535,101 C565,105 590,117 606,139
           C617,154 617,169 609,180 C601,190 585,190 570,188
           L120,188 Z"
        fill="url(#carBody)"
        stroke="#525c72"
        strokeWidth="1.5"
      />

      {/* glasshouse */}
      <path
        d="M186,84 C204,62 228,46 258,42 C298,35 355,35 398,42
           C432,48 452,60 468,78 C440,74 400,72 330,72 C275,72 225,76 186,84 Z"
        fill="url(#carGlass)"
      />
      <line x1="330" y1="42" x2="330" y2="74" stroke="#05060a" strokeWidth="3" />

      {/* accent stripe / beltline highlight */}
      <path d="M95,146 L580,146" stroke="url(#carStripe)" strokeWidth="2" />

      {/* door handles */}
      <rect x="228" y="128" width="18" height="4" rx="2" fill="#7a8296" opacity="0.8" />
      <rect x="368" y="128" width="18" height="4" rx="2" fill="#7a8296" opacity="0.8" />

      {/* headlight */}
      <circle
        cx="606"
        cy="151"
        r="16"
        fill="url(#carHeadGlow)"
        className="car-svg__headlight-glow"
        style={{ opacity: lit ? 1 : 0 }}
      />
      <ellipse cx="604" cy="151" rx="7" ry="5" fill={lit ? "#fffdf6" : "#8a8f9c"} />

      {/* taillight */}
      <circle
        cx="46"
        cy="167"
        r="12"
        fill="url(#carTailGlow)"
        className="car-svg__tail-glow"
        style={{ opacity: lit ? 0.85 : 0.25 }}
      />
      <ellipse cx="46" cy="167" rx="5" ry="4" fill={lit ? "#ff5c5c" : "#7a3232"} />

      {/* rear wheel */}
      <g className="car-svg__wheel" style={{ transformOrigin: "150px 185px" }}>
        <circle cx="150" cy="185" r="38" fill="#0b0d12" stroke="#5a6376" strokeWidth="3" />
        <circle cx="150" cy="185" r="16" fill="#242a35" stroke="#8891a3" strokeWidth="2" />
        <g stroke="#8891a3" strokeWidth="3">
          <line x1="150" y1="169" x2="150" y2="201" />
          <line x1="134" y1="185" x2="166" y2="185" />
          <line x1="139" y1="174" x2="161" y2="196" />
          <line x1="161" y1="174" x2="139" y2="196" />
        </g>
      </g>

      {/* front wheel */}
      <g className="car-svg__wheel" style={{ transformOrigin: "470px 185px" }}>
        <circle cx="470" cy="185" r="38" fill="#0b0d12" stroke="#5a6376" strokeWidth="3" />
        <circle cx="470" cy="185" r="16" fill="#242a35" stroke="#8891a3" strokeWidth="2" />
        <g stroke="#8891a3" strokeWidth="3">
          <line x1="470" y1="169" x2="470" y2="201" />
          <line x1="454" y1="185" x2="486" y2="185" />
          <line x1="459" y1="174" x2="481" y2="196" />
          <line x1="481" y1="174" x2="459" y2="196" />
        </g>
      </g>

      {/* sill highlight */}
      <path d="M120,186 C220,196 440,196 570,186" stroke="#000" strokeWidth="6" opacity="0.35" fill="none" />
    </svg>
  );
}

export default CarSVG;
