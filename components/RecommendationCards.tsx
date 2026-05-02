import type { Recommendation } from "@/lib/options";

const tierStyles: Record<string, { ring: string; tag: string; label: string; emoji: string }> = {
  Conservative: { ring: "border-emerald-700/60",  tag: "bg-emerald-900/40 text-emerald-300", label: "Lowest assignment risk", emoji: "🛡️" },
  Balanced:     { ring: "border-amber-700/60",    tag: "bg-amber-900/40 text-amber-300",     label: "Best risk/reward",       emoji: "⚖️" },
  Aggressive:   { ring: "border-rose-700/60",     tag: "bg-rose-900/40 text-rose-300",       label: "Highest premium",        emoji: "🔥" },
};

export default function RecommendationCards({ recs }: { recs: Recommendation[] }) {
  if (!recs.length) {
    return (
      <div className="text-gray-500 text-sm border border-border bg-panel rounded-lg p-4">
        No clean recommendations available right now.
      </div>
    );
  }
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {recs.map((r) => {
        const c = r.candidate;
        const s = tierStyles[r.tier];
        return (
          <div
            key={r.tier}
            className={`bg-panel border-2 ${s.ring} rounded-xl p-5 flex flex-col gap-3`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="font-semibold text-white">{r.tier}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${s.tag}`}>
                {s.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-white">${c.strike}</span>
              <span className="text-sm text-gray-400">{c.type}</span>
              <span className="ml-auto text-sm text-gray-400">{c.expiration}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Stat label="Credit"   value={`$${c.credit.toFixed(0)}`} />
              <Stat label="Ann. yield" value={`${c.annYieldPct.toFixed(1)}%`} highlight />
              <Stat label="Delta"    value={c.delta.toFixed(2)} />
              <Stat label="POP"      value={`${(c.pop * 100).toFixed(0)}%`} />
              <Stat label="DTE"      value={`${c.dte}d`} />
              <Stat label="Breakeven" value={`$${c.breakeven.toFixed(2)}`} />
            </div>

            <div className="text-xs text-gray-400 leading-relaxed pt-1 border-t border-border mt-1 pt-3">
              {r.rationale}
            </div>
            <div className="text-[11px] text-gray-500">{r.assignmentRisk}</div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-gray-500 uppercase tracking-wider text-[10px]">{label}</div>
      <div className={highlight ? "text-accent font-semibold" : "text-gray-200"}>{value}</div>
    </div>
  );
}
