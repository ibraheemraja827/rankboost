
"use client";

import { useState } from "react";
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
  FileSearch,
  Menu,
  X,
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
  transition: all 0.25s ease;
}

.nav-item:hover {
  transform: translateX(4px);
  color: #c9caff;
  background: rgba(62, 63, 126, 0.25);
  border-color: rgba(162, 163, 233, 0.3);
}

.nav-item.active {
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(
    135deg,
    rgba(62, 63, 126, 0.7),
    rgba(62, 63, 126, 0.25)
  );
  border: 1px solid #a2a3e9;
  box-shadow: 0 8px 24px rgba(62, 63, 126, 0.35);
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 22%;
  height: 56%;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: #a2a3e9;
}

.nav-item.logout:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 13px 14px;
  border: 1px solid rgba(246, 246, 253, 0.08);
  border-radius: 12px;
  color: rgba(246, 246, 253, 0.75);
  font-size: 14px;
  overflow-wrap: anywhere;
  transition: background 0.2s ease;
}

.mobile-nav-link.active {
  color: #c9caff;
  background: rgba(62, 63, 126, 0.3);
  border-color: rgba(162, 163, 233, 0.4);
}

.mobile-nav-link svg {
  flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .mobile-nav-link {
    transition: none;
  }
}
`;

export default function AppShell({ email, onLogout, children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) => {
    if (href.includes("#")) return false;
    return pathname === href;
  };

  return (
    <div className="relative min-h-screen md:flex">
      <style>{NAV_CSS}</style>

      <ParticleBackground variant="cloud" />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-20 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-black/30 p-5 md:flex">
        <div className="mb-1">
          <Logo />
        </div>

        <div className="mb-8 text-xs text-[var(--muted)]">
          by TAMx Technologies
        </div>

        <nav className="space-y-1.5">
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={label}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[var(--border)] pt-4">
          <div
            className="mb-3 truncate text-xs text-[var(--muted)]"
            title={email}
          >
            {email}
          </div>

          <button onClick={onLogout} className="nav-item logout">
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">

        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[#08080c]/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex min-h-11 items-center justify-between gap-3">

            <div className="min-w-0">
              <Logo />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white/5 text-[var(--text)]"
            >
              {mobileMenuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="mt-4 max-h-[70dvh] overflow-y-auto border-t border-[var(--border)] pt-4">

              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                Dashboard Navigation
              </p>

              <nav className="space-y-2">
                {NAV.map(({ href, label, Icon }) => {
                  const active = isActive(href);

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav-link ${
                        active ? "active" : ""
                      }`}
                    >
                      <Icon size={19} />
                      <span className="min-w-0 flex-1">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <p className="mb-3 break-all text-xs text-[var(--muted)]">
                  {email}
                </p>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="mobile-nav-link"
                >
                  <LogOut size={19} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl min-w-0 px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
