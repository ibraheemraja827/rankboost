"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, User } from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

const inputCls =
  "w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 outline-none placeholder:text-[var(--muted)] focus:border-[var(--primary)]";

function SectionTitle({ Icon, title, sub }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary-2)]">
        <Icon size={20} />
      </span>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {sub && <p className="text-sm text-[var(--muted)]">{sub}</p>}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delBusy, setDelBusy] = useState(false);
  const [delMsg, setDelMsg] = useState("");
  const [delErr, setDelErr] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/app");
        return;
      }
      setUser(session.user);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace("/app");
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/app");
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (next.length < 6) return setPwErr("New password must be at least 6 characters.");
    if (next !== confirm) return setPwErr("New password and confirmation do not match.");
    if (next === current) return setPwErr("New password must be different from the current one.");

    setPwBusy(true);
    try {
      // purana password check karein
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      if (signErr) throw new Error("Current password is incorrect.");

      const { error: upErr } = await supabase.auth.updateUser({ password: next });
      if (upErr) throw upErr;

      setPwMsg("Password updated.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  async function deleteAllData() {
    setDelBusy(true);
    setDelErr("");
    setDelMsg("");
    try {
      const r1 = await supabase.from("reports").delete().eq("user_id", user.id);
      if (r1.error) throw r1.error;
      const r2 = await supabase.from("score_history").delete().eq("user_id", user.id);
      if (r2.error) throw r2.error;
      setDelMsg("All saved reports and score history have been deleted.");
      setConfirmDelete(false);
    } catch (err) {
      setDelErr(err.message);
    } finally {
      setDelBusy(false);
    }
  }

  if (!authReady) {
    return <main className="px-6 py-20 text-center text-[var(--muted)]">Loading...</main>;
  }

  return (
    <AppShell email={user?.email} onLogout={logout}>
      <div className="mb-6">
        <h1 className="text-3xl font-light">
          <span className="font-bold italic text-[var(--primary-2)]">Settings</span>
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage your account and your saved data.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account */}
        <div className="card p-6">
          <SectionTitle Icon={User} title="Account" sub="The email you use to log in." />
          <div className="rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-sm">
            {user?.email}
          </div>
        </div>

        {/* Password */}
        <div className="card p-6">
          <SectionTitle Icon={KeyRound} title="Change password" sub="Enter your current password first." />
          <form onSubmit={changePassword} className="space-y-3">
            <input
              type="password"
              required
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className={inputCls}
            />
            <input
              type="password"
              required
              minLength={6}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="New password (min 6 characters)"
              autoComplete="new-password"
              className={inputCls}
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className={inputCls}
            />
            <button disabled={pwBusy} className="btn-primary px-6 py-3 font-medium disabled:opacity-60">
              {pwBusy ? "Updating..." : "Update password"}
            </button>
          </form>
          {pwErr && <p className="mt-3 text-sm text-red-400">{pwErr}</p>}
          {pwMsg && <p className="mt-3 text-sm text-green-400">{pwMsg}</p>}
        </div>

        {/* Data */}
        <div className="card p-6">
          <SectionTitle
            Icon={Trash2}
            title="Delete my data"
            sub="Removes all your saved reports (including AI fixes and crawl results) and your score history."
          />
          {!confirmDelete ? (
            <button
              onClick={() => {
                setConfirmDelete(true);
                setDelMsg("");
                setDelErr("");
              }}
              className="rounded-full border border-red-500/40 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              Delete all reports and history
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <p className="mb-3 text-sm text-gray-300">
                This cannot be undone. Are you sure you want to delete everything?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteAllData}
                  disabled={delBusy}
                  className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {delBusy ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={delBusy}
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {delErr && <p className="mt-3 text-sm text-red-400">{delErr}</p>}
          {delMsg && <p className="mt-3 text-sm text-green-400">{delMsg}</p>}
        </div>
      </div>
    </AppShell>
  );
}