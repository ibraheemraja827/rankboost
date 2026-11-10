"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const DASHBOARD = "/app"; // dashboard ka address

export default function NavAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/app";
  }

  if (!ready) return <div className="h-10 w-40" />;

  if (!user) {
    return (
      <Link href="/app" className="btn-primary px-5 py-2 text-sm font-medium">
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={DASHBOARD} className="btn-primary px-5 py-2 text-sm font-medium">
        Dashboard
      </Link>
      <button
        onClick={logout}
        className="rounded-full border border-[var(--border)] px-5 py-2 text-sm text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
      >
        Log out
      </button>
    </div>
  );
}