export default function ScoreGauge({ score, grade }) {
  const r = 80;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const filled = arc * (score / 100);

  return (
    <div className="relative mx-auto h-56 w-56">
      <svg viewBox="0 0 200 200" className="h-full w-full rotate-[135deg]">
        <defs>
          <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b8df5" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke="#1a1a2e" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${arc} ${c}`}
        />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke="url(#gauge)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${filled} ${c}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold">
          {score}<span className="text-lg font-normal text-[var(--muted)]">/100</span>
        </div>
        <div className="text-3xl font-bold text-[var(--primary-2)]">{grade}</div>
      </div>
    </div>
  );
}