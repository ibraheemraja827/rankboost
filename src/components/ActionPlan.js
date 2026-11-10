"use client";
import { ListChecks, Zap } from "lucide-react";
import { buildActionPlan } from "@/lib/actionPlan";

const STATUS = {
  error: { label: "Critical", cls: "bg-red-500/15 text-red-400" },
  warning: { label: "Needs work", cls: "bg-orange-500/15 text-orange-400" },
};

export default function ActionPlan({ results }) {
  const { top, total } = buildActionPlan(results, 5);

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary-2)]">
          <ListChecks size={20} />
        </span>
        <div>
          <h2 className="font-semibold">Priority Action Plan</h2>
          <p className="text-sm text-[var(--muted)]">
            {total === 0
              ? "Koi bara masla nahi mila."
              : total <= 5
              ? `${total} cheezein theek karni hain, sab se zaroori pehle.`
              : `${total} masle mile. Pehle yeh 5 theek karein.`}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-black/30 p-4 text-sm text-gray-300">
          Scan kiye gaye saare factors theek hain. Neeche crawl chala kar baaqi pages bhi check kar lein.
        </p>
      ) : (
        <ol className="space-y-4">
          {top.map((it, i) => {
            const st = STATUS[it.status];
            return (
              <li key={it.key} className="rounded-xl border border-[var(--border)] bg-black/30 p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)]/15 text-sm font-semibold text-[var(--primary-2)]">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold">{it.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${st.cls}`}>{st.label}</span>
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
                    Effort: {it.effort}
                  </span>
                  {it.effort === "Easy" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs text-green-400">
                      <Zap size={12} /> Quick win
                    </span>
                  )}
                </div>

                {it.message && (
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="text-[var(--muted)]">Scan result: </span>
                    {it.message}
                  </p>
                )}
                <p className="mb-3 text-sm leading-relaxed text-gray-300">{it.why}</p>

                <ul className="space-y-1.5">
                  {it.how.map((h, j) => (
                    <li key={j} className="flex gap-2 text-sm text-gray-300">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary-2)]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-5 text-xs text-[var(--muted)]">
        Yeh tarteeb scan ke natayij aur har factor ke aam SEO asar par mabni hai. Koi bhi tool ranking ki guarantee nahi de sakta.
      </p>
    </div>
  );
}