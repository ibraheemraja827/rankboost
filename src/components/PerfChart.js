"use client";
import { useState } from "react";
import { fmt } from "@/lib/gsc";

const W = 800, H = 300, L = 48, R = 56, T = 16, B = 32;
const BLUE = "#4f8ef7";
const PURPLE = "#8b8df5";

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

export default function PerfChart({ data, show }) {
  const [hover, setHover] = useState(null);
  if (!data.length) return null;

  const maxC = niceMax(Math.max(...data.map((d) => d.clicks)));
  const maxI = niceMax(Math.max(...data.map((d) => d.impressions)));
  const iw = W - L - R;
  const ih = H - T - B;

  const x = (i) => L + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const yC = (v) => T + ih - (v / maxC) * ih;
  const yI = (v) => T + ih - (v / maxI) * ih;
  const line = (fn, key) =>
    data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${fn(d[key]).toFixed(1)}`).join(" ");

  const every = Math.max(1, Math.ceil(data.length / 7));
  const short = (s) => {
    const d = new Date(s);
    return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - L) / iw) * (data.length - 1));
    setHover(Math.min(data.length - 1, Math.max(0, i)));
  }

  const h = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 1, 2, 3, 4].map((t) => {
          const y = T + ih - (t / 4) * ih;
          return (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke="#1d1d33" />
              <text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill={BLUE}>
                {fmt((maxC * t) / 4)}
              </text>
              <text x={W - R + 8} y={y + 4} fontSize="11" fill={PURPLE}>
                {fmt((maxI * t) / 4)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) =>
          i % every === 0 ? (
            <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#9a9ab5">
              {short(d.date)}
            </text>
          ) : null
        )}

        {show.impressions && (
          <path d={line(yI, "impressions")} fill="none" stroke={PURPLE} strokeWidth="2.5" strokeLinejoin="round" />
        )}
        {show.clicks && (
          <path d={line(yC, "clicks")} fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinejoin="round" />
        )}

        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} stroke="#4a4a6a" strokeDasharray="4 4" />
            {show.clicks && <circle cx={x(hover)} cy={yC(h.clicks)} r="4.5" fill={BLUE} />}
            {show.impressions && <circle cx={x(hover)} cy={yI(h.impressions)} r="4.5" fill={PURPLE} />}
          </g>
        )}
      </svg>

      {h && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-[var(--border)] bg-[#0b0b16] px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            transform: hover > data.length * 0.65 ? "translateX(-110%)" : "translateX(10%)",
          }}
        >
          <div className="mb-1 font-medium">{short(h.date)}</div>
          <div style={{ color: BLUE }}>Clicks: {h.clicks}</div>
          <div style={{ color: PURPLE }}>Impressions: {h.impressions}</div>
        </div>
      )}
    </div>
  );
}