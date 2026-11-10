"use client";
import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);

function buildCloud(light) {
  const dim = [];
  const bright = [];
  const n = light ? 350 : 700;
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * TAU;
    const r = Math.cbrt(Math.random());
    const s = Math.sqrt(1 - u * u);
   dim.push({ x: r * s * Math.cos(th), y: r * u, z: r * s * Math.sin(th), a: rand(0.5, 0.9), s: rand(1.2, 2.2) });
  }
  for (let k = 0; k < 5; k++) {
    const tiltX = rand(0, Math.PI);
    const tiltZ = rand(0, Math.PI);
    const start = rand(0, TAU);
    const span = rand(0.5, 1.1);
    const thick = rand(0.012, 0.03);
    const count = light ? 90 : 160;
    for (let i = 0; i < count; i++) {
      const ang = start + (i / count) * span;
      const x = Math.cos(ang) + rand(-thick, thick);
      const y = Math.sin(ang) + rand(-thick, thick);
      const z = rand(-thick, thick);
      const y1 = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      const z1 = y * Math.sin(tiltX) + z * Math.cos(tiltX);
      const x1 = x * Math.cos(tiltZ) - y1 * Math.sin(tiltZ);
      const y2 = x * Math.sin(tiltZ) + y1 * Math.cos(tiltZ);
      bright.push({ x: x1, y: y2, z: z1, a: rand(0.7, 1), s: rand(1, 1.8) });
    }
  }
  return { dim, bright };
}

function buildRibbon(light) {
  const ribbon = [];
  const per = light ? 240 : 420;
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < per; i++) {
      ribbon.push({ t: i / (per - 1), strand: s, a: rand(0.6, 1), s: rand(0.8, 1.5), j: rand(-0.004, 0.004) });
    }
  }
  const dust = [];
  for (let i = 0; i < (light ? 90 : 180); i++) {
    dust.push({ x: rand(-1.4, 1.4), y: rand(-1, 1), a: rand(0.15, 0.5), s: rand(0.6, 1.2), vy: rand(0.0003, 0.0012) });
  }
  return { ribbon, dust };
}

export default function ParticleBackground({ variant = "cloud", opacity = 0.95 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = window.innerWidth < 640;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const data = variant === "ribbon" ? buildRibbon(light) : buildCloud(light);
    let w = 0;
    let h = 0;
    let raf = 0;

    function drawCloud(t) {
      const cx = w * 0.62;
      const cy = h * 0.5;
      const R = Math.min(w, h) * 0.5;
      const ay = t * 0.00011;
      const ax = 0.55 + Math.sin(t * 0.00007) * 0.15;
      const cY = Math.cos(ay), sY = Math.sin(ay), cX = Math.cos(ax), sX = Math.sin(ax);

      const pass = (list, color) => {
        ctx.fillStyle = color;
        for (const p of list) {
          const x1 = p.x * cY + p.z * sY;
          const z1 = -p.x * sY + p.z * cY;
          const y2 = p.y * cX - z1 * sX;
          const z2 = p.y * sX + z1 * cX;
          const k = 2.4 / (2.4 - z2);
         ctx.globalAlpha = Math.min(1, p.a * (0.6 + 0.4 * ((z2 + 1) / 2)));
          const size = p.s * k;
          ctx.fillRect(cx + x1 * R * k, cy + y2 * R * k, size, size);
        }
      };
      pass(data.dim, "#7476e8");
      pass(data.bright, "#cfd0ff");
    }

    function drawRibbon(t) {
      const cx = w * 0.62;
      const cy = h * 0.5;
      const R = h * 0.5;
      const rot = -0.35;
      const cr = Math.cos(rot), sr = Math.sin(rot);

      ctx.fillStyle = "#7476e8";
      for (const p of data.dust) {
        if (!reduce) {
          p.y -= p.vy;
          if (p.y < -1) p.y = 1;
        }
        ctx.globalAlpha = p.a;
        ctx.fillRect(cx + p.x * R, cy + p.y * R, p.s, p.s);
      }

      ctx.fillStyle = "#cfd0ff";
      for (const p of data.ribbon) {
        const ang = p.t * TAU * 1.4 + t * 0.0004 + p.strand * Math.PI;
        const rad = 0.5 + 0.22 * Math.sin(p.t * TAU * 0.8 + t * 0.0002);
        const x = (rad * Math.cos(ang) + p.j) * 1.5;
        const z = rad * Math.sin(ang);
        const y = (p.t - 0.5) * 2.2;
        const xr = x * cr - y * sr;
        const yr = x * sr + y * cr;
        const k = 2.4 / (2.4 - z);
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.a * ((z + 0.6) / 1.2)));
        const size = p.s * k;
        ctx.fillRect(cx + xr * R * k, cy + yr * R * k, size, size);
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      if (variant === "ribbon") drawRibbon(t);
      else drawCloud(t);
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce) frame(0);
    }

    resize();
    window.addEventListener("resize", resize);
    if (!reduce) raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [variant]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
    />
  );
}