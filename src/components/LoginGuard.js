"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginGuard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      if (!session) router.replace("/app");
      else setChecking(false);
    });
    return () => {
      alive = false;
    };
  }, [router]);

  if (!checking) return null;
  return <div className="fixed inset-0 z-[100] bg-[#020202]" />;
}