"use client";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const ACCENT = "#a2a3e9";

const CSS = `
@keyframes lampPing {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2.8); opacity: 0; }
}
.lamp-ping { transform-box: fill-box; transform-origin: center; animation: lampPing 1.8s ease-out infinite; }
.lamp-pull { cursor: pointer; outline: none; }
.lamp-pull:focus-visible .lamp-hit { stroke: ${ACCENT}; stroke-width: 2; }
@keyframes lampFlicker {
  0% { opacity: 0.2; } 12% { opacity: 1; } 22% { opacity: 0.4; } 34% { opacity: 1; } 100% { opacity: 1; }
}
.lamp-flicker { animation: lampFlicker 0.7s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .lamp-ping, .lamp-flicker { animation: none; }
}
`;

function Lamp({ on, pulled, onPull }) {
  return (
    <svg
      viewBox="0 0 300 460"
     className="w-full max-w-[280px] sm:max-w-[340px]"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.5" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lampShadeOn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4d5ff" />
          <stop offset="100%" stopColor="#6e70c9" />
        </linearGradient>
        <radialGradient id="lampFloor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.55" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </radialGradient>
      </defs>
 
      {/* Roshni ka cone aur farsh ka glow */}
      <g style={{ opacity: on ? 1 : 0, transition: "opacity 0.9s ease" }}>
        <polygon points="70,152 230,152 345,428 -45,428" fill="url(#lampCone)" />
        <ellipse cx="150" cy="430" rx="170" ry="26" fill="url(#lampFloor)" />
      </g>

      {/* Pole aur base */}
      <rect x="147" y="150" width="6" height="275" fill="#15151f" stroke="#25253a" />
      <ellipse cx="150" cy="428" rx="58" ry="11" fill="#15151f" stroke="#25253a" />

      {/* Shade (band) */}
      <path d="M110 70 L190 70 L230 150 L70 150 Z" fill="#16162a" stroke="#2c2c4a" strokeWidth="1.5" />

      {/* Shade (roshan) */}
      <g
        className={on ? "lamp-flicker" : ""}
        style={{
          opacity: on ? 1 : 0,
          transition: "opacity 0.6s ease, filter 0.8s ease",
          filter: on ? "drop-shadow(0 0 22px rgba(162,163,233,0.65))" : "none",
        }}
      >
        <path d="M110 70 L190 70 L230 150 L70 150 Z" fill="url(#lampShadeOn)" stroke={ACCENT} strokeWidth="1.5" />
      </g>

      {/* Bulb */}
      <circle cx="150" cy="152" r="11" style={{ fill: on ? "#f2f2ff" : "#2a2a45", transition: "fill 0.6s ease" }} />

      {/* Dori */}
      <circle cx="218" cy="128" r="2.5" fill="#8b8df5" />
      <line
        x1="218" y1="128" x2="218" y2="238"
        stroke="#8b8df5" strokeWidth="1.6"
        style={{
          transformOrigin: "218px 128px",
          transform: `scaleY(${pulled ? 1.2 : 1})`,
          transition: "transform 0.18s ease-out",
        }}
      />
      <g
        className="lamp-pull"
        role="button"
        tabIndex={0}
        aria-label={on ? "Pull the cord to switch the light off" : "Pull the cord to switch the light on and sign in"}
        onClick={onPull}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPull();
          }
        }}
      >
        {!on && <circle className="lamp-ping" cx="218" cy="248" r="7" fill="none" stroke={ACCENT} strokeWidth="1.5" />}
        <circle className="lamp-hit" cx="218" cy="250" r="24" fill="transparent" stroke="transparent" />
        <g style={{ transform: `translateY(${pulled ? 22 : 0}px)`, transition: "transform 0.18s ease-out" }}>
          <circle cx="218" cy="248" r="7.5" fill={ACCENT} />
          <circle cx="216" cy="246" r="2.2" fill="#fff" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}

export default function AuthPanel() {
   const router = useRouter();
  const [on, setOn] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const emailRef = useRef(null);

  function pull() {
    setPulled(true);
    setTimeout(() => setPulled(false), 220);
    setOn((v) => !v);
  }

  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => emailRef.current?.focus(), 800);
    return () => clearTimeout(t);
  }, [on]);

 async function submit(e) {
  e.preventDefault();
  setBusy(true);
  setError("");
  setMsg("");
  try {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.session) router.push("/");
      else setMsg("Account created. Check your email to confirm, then log in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setBusy(false);
  }
}

  const inputCls =
    "w-full rounded-xl border border-[#1d1d33] bg-black/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#6a6a85] focus:border-[#a2a3e9]";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#020202] text-white">
      <style>{CSS}</style>

      {/* Roshni on hone par peeche ka glow */}
     <div
  className="pointer-events-none absolute inset-0"
  style={{
    opacity: on ? 1 : 0,
    transition: "opacity 1s ease",
    background:
      "radial-gradient(60rem 40rem at 25% 55%, rgba(162,163,233,0.2), transparent 60%)",
  }}
/>
      <div className="absolute left-6 top-6 z-10">
  <Logo withName />
</div>

     <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl items-center gap-3 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-6">

  {/* Lamp */}
  <div className="flex flex-col items-center justify-center">
    <div className="w-[min(75vw,340px)] max-h-[55vh] [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-h-[55vh]">
      <Lamp on={on} pulled={pulled} onPull={pull} />
    </div>

    <p className="mt-3 text-sm text-[#9a9ab5]">
      {on
        ? "Pull the cord again to switch the light off"
        : "Pull the cord to sign in"}
    </p>
  </div>

        {/* Login card */}
        <div
          aria-hidden={!on}
          className="mx-auto w-full max-w-md rounded-2xl border border-[#1d1d33] bg-[#0a0a14]/80 p-8 backdrop-blur"
         style={{
  opacity: on ? 1 : 0,
  transform: on ? "translateX(0)" : "translateX(40px)",
  visibility: on ? "visible" : "hidden",
  transition: `opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s, visibility 0s linear ${on ? "0s" : "1s"}`,
}}
        >
          <div className="mb-2 text-xs uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
            RankBoost AI
          </div>
          <h2 className="text-3xl font-light">
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h2>
          <p className="mb-6 text-2xl font-semibold italic" style={{ color: ACCENT }}>
            {"Let's rank your site."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <input
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={inputCls}
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ab5] hover:text-white"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button disabled={busy} className="btn-primary w-full py-3 font-medium disabled:opacity-60">
              {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {msg && <p className="mt-3 text-sm text-green-400">{msg}</p>}

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
              setMsg("");
            }}
            className="mt-5 text-sm text-[#9a9ab5] hover:text-white"
          >
            {mode === "login" ? "No account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}