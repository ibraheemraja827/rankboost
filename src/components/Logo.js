export default function Logo({ height = 30, withName = false, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        aria-label="TAMx"
        className="font-semibold tracking-[-0.08em] text-[#c8e7ff]"
        style={{ fontSize: Math.round(height * 0.82), lineHeight: 1 }}
      >
        TAM<span className="text-[#bcb7ff]">x</span>
      </span>
      {withName && (
        <>
          <span className="h-5 w-px bg-[var(--border)]" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">
            Rank<span className="text-[var(--primary-2)]">Boost</span> AI
          </span>
        </>
      )}
    </span>
  );
}
