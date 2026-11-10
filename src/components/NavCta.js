"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NavCta() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Link
      href="/app"
      className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-medium"
    >
      {ready && loggedIn ? (
        <>
          <LayoutDashboard size={16} /> Dashboard
        </>
      ) : (
        "Log in"
      )}
    </Link>
  );
}