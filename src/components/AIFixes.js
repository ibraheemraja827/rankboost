"use client";
import { useState } from "react";
import {
  Copy, Check, Type, FileText, Tag,
  Image as ImageIcon, Code2, Lightbulb,
} from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)] transition hover:bg-white/5 hover:text-white"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Section({ Icon, title, copyText, badge, children }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-black/30 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/15 text-[var(--primary-2)]">
            <Icon size={16} />
          </span>
          <h3 className="font-semibold">{title}</h3>
          {badge}
        </div>
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
      {children}
    </div>
  );
}

function LengthBadge({ len, min, max }) {
  const ok = len >= min && len <= max;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs ${
        ok ? "bg-green-500/15 text-green-400" : "bg-orange-500/15 text-orange-400"
      }`}
    >
      {len} characters · ideal {min}-{max}
    </span>
  );
}

function fileName(src) {
  try {
    const clean = String(src).split("?")[0];
    return clean.split("/").filter(Boolean).pop() || src;
  } catch {
    return src;
  }
}

export default function AIFixes({ fixes }) {
  const title = fixes.newTitle || "";
  const desc = fixes.newMetaDescription || "";
  const keywords = fixes.keywords || [];
  const alts = fixes.imageAlts || [];
  const tips = (fixes.contentTips || []).map((t) => String(t).replace(/^[-•*\s]+/, ""));
  const schemaText = `<script type="application/ld+json">\n${JSON.stringify(fixes.schema || {}, null, 2)}\n</script>`;

  return (
    <div className="mt-6 space-y-4">
      <Section
        Icon={Type}
        title="New Title"
        copyText={title}
        badge={<LengthBadge len={title.length} min={30} max={60} />}
      >
        <p className="text-base leading-relaxed text-gray-100">{title}</p>
      </Section>

      <Section
        Icon={FileText}
        title="New Meta Description"
        copyText={desc}
        badge={<LengthBadge len={desc.length} min={120} max={160} />}
      >
        <p className="leading-relaxed text-gray-300">{desc}</p>
      </Section>

      {keywords.length > 0 && (
        <Section Icon={Tag} title="Target Keywords" copyText={keywords.join(", ")}>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-3 py-1 text-sm text-[var(--primary-2)]"
              >
                {k}
              </span>
            ))}
          </div>
        </Section>
      )}

      {alts.length > 0 && (
        <Section
          Icon={ImageIcon}
          title="Image Alt Text"
          copyText={alts.map((i) => `${i.src}\n-> ${i.alt}`).join("\n\n")}
        >
          <div className="divide-y divide-[var(--border)]">
            {alts.map((a, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="mb-1 truncate text-xs text-[var(--muted)]" title={a.src}>
                  {fileName(a.src)}
                </div>
                <div className="text-gray-200">{a.alt}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section Icon={Code2} title="Schema Markup (JSON-LD)" copyText={schemaText}>
        <p className="mb-3 text-xs text-[var(--muted)]">
          Isay apni website ke &lt;head&gt; mein paste karein.
        </p>
        <pre className="max-h-72 overflow-auto rounded-lg border border-[var(--border)] bg-black/40 p-4 font-mono text-xs leading-relaxed text-gray-300">
          {schemaText}
        </pre>
      </Section>

      {tips.length > 0 && (
        <Section Icon={Lightbulb} title="Content Tips" copyText={tips.map((t) => "- " + t).join("\n")}>
          <ol className="space-y-3">
            {tips.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-xs font-semibold text-[var(--primary-2)]">
                  {i + 1}
                </span>
                <span className="leading-relaxed text-gray-300">{t}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <p className="text-xs text-[var(--muted)]">
        AI suggestions hain. Publish karne se pehle review zaroor karein. Koi bhi tool ranking ki guarantee nahi de sakta.
      </p>
    </div>
  );
}