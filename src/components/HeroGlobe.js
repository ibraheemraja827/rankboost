export default function HeroGlobe() {
  const R = 170;
  const C = 200;
  const tilt = (20 * Math.PI) / 180;
  const lats = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6f72ea" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#6f72ea" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#6f72ea" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r={R + 28} fill="url(#globeGlow)" className="glow-pulse" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="#6f72ea" strokeOpacity="0.6" strokeWidth="1.5" />

      {lats.map((deg) => {
        const phi = (deg * Math.PI) / 180;
        const rx = R * Math.cos(phi);
        const ry = rx * Math.sin(tilt);
        const cy = C - R * Math.sin(phi) * Math.cos(tilt);
        return (
          <ellipse
            key={deg}
            cx={C}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="#8b8df5"
            strokeOpacity="0.85"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="0.1 7"
            className="lat-dots"
          />
        );
      })}

      {[0, 1, 2, 3, 4, 5].map((m) => (
        <ellipse
          key={m}
          cx={C}
          cy={C}
          rx={R}
          ry={R}
          fill="none"
          stroke="#6f72ea"
          strokeOpacity="0.35"
          strokeWidth="1"
          className="meridian"
          style={{ animationDelay: `-${(m * 14) / 6}s` }}
        />
      ))}

      <g className="spin-slow" style={{ transformOrigin: "200px 200px" }}>
        <circle cx={C} cy={C} r={R + 14} fill="none" stroke="#8b8df5" strokeOpacity="0.4" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx={C + R + 14} cy={C} r="4.5" fill="#8b8df5" />
      </g>
    </svg>
  );
}