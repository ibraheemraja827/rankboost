"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ScanSearch,
  TrendingUp,
  FileText,
  History,
  Scale,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Link2,
  FileSearch
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import Logo from "@/components/Logo";

const NAV = [
  { href: "/overview", label: "Overview", Icon: LayoutGrid },
  { href: "/app", label: "New Scan", Icon: ScanSearch },
  { href: "/performance", label: "Performance", Icon: TrendingUp },
  { href: "/app#reports", label: "My Reports", Icon: FileText },
  { href: "/history", label: "Score History", Icon: History },
  { href: "/compare", label: "Competitor Compare", Icon: Scale },

  // New SEO Tools
  { href: "/on-page-seo", label: "On-Page SEO", Icon: FileSearch },
  { href: "/keywords", label: "Keyword Tracker", Icon: Search },
  { href: "/backlinks", label: "Backlink Analysis", Icon: Link2 },

  { href: "/help", label: "Help & Guide", Icon: HelpCircle },
  { href: "/settings", label: "Settings", Icon: Settings },
];

const NAV_CSS = `
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 13px 18px;
  border-radius: 14px;
  font-size: 0.875rem;
  color: rgba(162, 163, 233, 0.65);
  border: 1px solid transparent;
  overflow: hidden;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease,
    box-shadow 0.25s ease, border-color 0.25s ease;
}

.nav-item:hover {
  transform: translateX(4px);
  color: #a2a3e9;
  background: linear-gradient(90deg, rgba(62, 63, 126, 0.25), rgba(62, 63, 126, 0.04));
  border-color: rgba(162, 163, 233, 0.15);
}

.nav-item svg {
  transition: transform 0.3s ease, filter 0.3s ease;
}
.nav-item:hover svg {
  transform: scale(1.15) rotate(-6deg);
  filter: drop-shadow(0 0 6px rgba(162, 163, 233, 0.6));
}

.nav-item.active {
  color: #c9caff;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(62, 63, 126, 0.55), rgba(62, 63, 126, 0.18));
  border-color: rgba(162, 163, 233, 0.35);
  box-shadow:
    0 0 0 1px rgba(162, 163, 233, 0.08) inset,
    0 8px 24px rgba(62, 63, 126, 0.45),
    0 0 18px rgba(162, 163, 233, 0.18);
  animation: navGlowPulse 3s ease-in-out infinite;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 22%;
  height: 56%;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(180deg, #a2a3e9, #3e3f7e);
  box-shadow: 0 0 10px #a2a3e9;
}

.nav-item.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(162, 163, 233, 0.18), transparent);
  transform: skewX(-20deg);
  animation: navShine 4s ease-in-out infinite;
  pointer-events: none;
}

.nav-item.logout:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

@keyframes navGlowPulse {
  0%, 100% {
    box-shadow: 0 0 0 1px rgba(162,163,233,0.08) inset, 0 8px 24px rgba(62,63,126,0.45), 0 0 14px rgba(162,163,233,0.15);
  }
  50% {
    box-shadow: 0 0 0 1px rgba(162,163,233,0.14) inset, 0 10px 30px rgba(62,63,126,0.6), 0 0 26px rgba(162,163,233,0.3);
  }
}

@keyframes navShine {
  0%, 60% { left: -60%; }
  100% { left: 130%; }
}

@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .nav-item.active,
  .nav-item.active::after {
    animation: none;
    transition: none;
  }
}
`;

export default function AppShell({ email, onLogout, children }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href.includes("#")) return false;
    return pathname === href;
  };

  return (
    <div className="relative min-h-screen md:flex">
      <style>{NAV_CSS}</style>
      <ParticleBackground variant="cloud" />
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-black/30 p-5 md:flex">
        <div className="mb-1">
          <Logo />
        </div>
        <div className="mb-8 text-xs text-[var(--muted)]">by TAMx Technologies</div>

        <nav className="space-y-1.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={label}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--border)] pt-4">
          <div className="mb-3 truncate text-xs text-[var(--muted)]" title={email}>
            {email}
          </div>
          <button onClick={onLogout} className="nav-item logout">
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <div className="border-b border-[var(--border)] bg-black/30 px-4 py-3 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <Logo />
            <button onClick={onLogout} className="text-xs text-[var(--muted)] hover:text-white">
              Log out
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                    active
                      ? "border-[var(--primary)]/40 bg-[var(--primary)]/15 text-[var(--primary-2)]"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
