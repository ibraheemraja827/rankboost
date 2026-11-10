const STYLES = {
  good: { label: "Good", cls: "bg-green-500/10 text-green-400" },
  warning: { label: "Warning", cls: "bg-orange-500/10 text-orange-400" },
  error: { label: "Error", cls: "bg-red-500/10 text-red-400" },
  pending: { label: "Soon", cls: "bg-white/5 text-[var(--muted)]" },
};

export default function FactorCard({ index, title, message, status, Icon }) {
  const s = STYLES[status] || STYLES.pending;
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a38] text-sm">
          {index}
        </span>
        <span className={`rounded-md px-2 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
      </div>
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#14142a] text-[var(--primary-2)]">
        <Icon size={18} />
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}