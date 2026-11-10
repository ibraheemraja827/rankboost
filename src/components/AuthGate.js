"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGate({ children }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/app");
      else setOk(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/app");
      else setOk(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!ok) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }
  return children;
}