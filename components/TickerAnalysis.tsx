"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import type { TickerView, Candidate } from "@/lib/options";

// ─── Risk tier config ────────────────────────────────────────────────────────

type RiskKey = "keep-shares" | "okay-to-sell" | "max-income";

const RISK_TIERS: Record<
  RiskKey,
  { label: string; emoji: string; targetDelta: number; keepPct: string; desc: string; deltaHint: string }
> = {
  "keep-shares": {
    label: "Keep Shares",
    emoji: "🛡️",
    targetDelta: 0.12,
    keepPct: "~88%",
    desc: "Low assignment risk, steady income",
    deltaHint: "Δ 0.08–0.16",
  },
  "okay-to-sell": {
    label: "Okay to Sell",
    emoji: "⚖️",
    targetDelta: 0.22,
    keepPct: "~78%",
    desc: "Best risk / reward balance",
    deltaHint: "Δ 0.18–0.28",
  },
  "max-income": {
    label: "Max Income",
    emoji: "🔥",
    targetDelta: 0.33,
    keepPct: "~67%",
    desc: "Maximum premium, higher risk",
    deltaHint: "Δ 0.28–0.40",
  },
};

// ─── Pure helpers (no server imports) ────────────────────────────────────────

function findBestMatch(
  candidates: Candidate[],
  type: "put" | "call",
  expiration: string | null,
  targetDelta: number
): Candidate | null {
  let pool = candidates.filter((c) => c.type === type);
  if (expiration) pool = pool.filter((c) => c.expiration === expiration);
  if (!pool.length) return null;
  return pool.reduce((best, c) => {
    const score = Math.abs(Math.abs(c.delta) - targetDelta);
    const bestScore = Math.abs(Math.abs(best.delta) - targetDelta);
    return score < bestScore ? c : best;
  });
}

function earningsBeforeExpiry(ts: number | null, expIso: string): boolean {
  if (!ts) return false;
  const ms = ts * 1000;
  return ms > Date.now() && ms < new Date(expIso).getTime() + 86_400_000;
}

function earningsLabel(date: string | null): { text: string; urgent: boolean } | null {
  if (!date) return null;
  const ts = new Date(date).getTime();
  const days = Math.ceil((ts - Date.now()) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return { text: "Earnings today", urgent: true };
  if (days <= 7) return { text: `Earnings in ${days}d`, urgent: true };
  const d = new Date(date);
  return {
    text: `Earnings ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    urgent: false,
  };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function generateWhyBullets(c: Candidate, view: TickerView): string[] {
  const earningsBefore = earningsBeforeExpiry(view.earningsTimestamp, c.expiration);
  const earningsAfter = view.earningsDate && !earningsBefore;
  const bullets: string[] = [];

  if (c.type === "put") {
    bullets.push(
      `Selling the $${c.strike} put collects $${c.credit.toFixed(0)} total ($${c.mid.toFixed(2)}/share) over ${c.dte} days`
    );
    bullets.push(
      `Breakeven at $${c.breakeven.toFixed(2)} — ${c.cushionPct.toFixed(1)}% below the current price of $${c.spot.toFixed(2)}`
    );
    bullets.push(
      `~${(c.pop * 100).toFixed(0)}% probability of expiring worthless, keeping the full premium`
    );
    bullets.push(`Time decay earns ~$${c.thetaDay.toFixed(2)}/day while you wait`);
    if (earningsBefore) {
      bullets.push(
        `⚠️ Earnings fall within this expiration — expect a large price move that could affect the outcome`
      );
    } else if (earningsAfter) {
      bullets.push(`Earnings on ${fmtDate(view.earningsDate!)} fall after expiry — no earnings event in this trade window`);
    }
  } else {
    bullets.push(
      `Selling the $${c.strike} covered call against 100 shares collects $${c.credit.toFixed(0)} total ($${c.mid.toFixed(2)}/share) over ${c.dte} days`
    );
    bullets.push(
      `Shares only get called away if ${view.symbol} rises ${c.cushionPct.toFixed(1)}% above current price to $${c.strike}`
    );
    bullets.push(
      `~${(c.pop * 100).toFixed(0)}% probability of expiring worthless — you keep shares and the full premium`
    );
    bullets.push(`Time decay earns ~$${c.thetaDay.toFixed(2)}/day toward your income`);
    if (earningsBefore) {
      bullets.push(
        `⚠️ Earnings fall within this expiration — elevated chance of shares being called away`
      );
    } else if (earningsAfter) {
      bullets.push(`Earnings on ${fmtDate(view.earningsDate!)} fall after expiry — no earnings volatility in this trade`);
    }
  }
  return bullets;
}

function fmtExp(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dteDays(iso: string): number {
  return Math.max(1, Math.round((new Date(iso).getTime() + 86_400_000 - Date.now()) / 86_400_000));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-bg border border-border rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className={`text-base font-semibold ${highlight ? "text-accent" : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function Warning({ text, level = "warn" }: { text: string; level?: "warn" | "info" }) {
  return (
    <div
      className={`flex items-start gap-2 text-xs rounded-md px-3 py-2 ${
        level === "warn"
          ? "bg-amber-950/40 border border-amber-800/40 text-amber-300"
          : "bg-blue-950/30 border border-blue-800/30 text-blue-300"
      }`}
    >
      <span>{level === "warn" ? "⚠️" : "ℹ️"}</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TickerAnalysis({ view }: { view: TickerView }) {
  const [optType, setOptType] = useState<"put" | "call">("put");
  const [riskKey, setRiskKey] = useState<RiskKey>("okay-to-sell");
  const [whyOpen, setWhyOpen] = useState(false);

  const availableExps = useMemo(
    () => [...new Set(view.candidates.map((c) => c.expiration))].sort(),
    [view.candidates]
  );

  const [selectedExp, setSelectedExp] = useState<string | null>(availableExps[0] ?? null);

  const tier = RISK_TIERS[riskKey];

  const topMatch = useMemo(
    () => findBestMatch(view.candidates, optType, selectedExp, tier.targetDelta),
    [view.candidates, optType, selectedExp, tier.targetDelta]
  );

  const compareStrikes = useMemo(() => {
    let pool = view.candidates.filter((c) => c.type === optType);
    if (selectedExp) pool = pool.filter((c) => c.expiration === selectedExp);
    // Sort riskiest (highest |delta|) first
    return pool.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }, [view.candidates, optType, selectedExp]);

  const earnings = earningsLabel(view.earningsDate);
  const earningsBefore = topMatch
    ? earningsBeforeExpiry(view.earningsTimestamp, topMatch.expiration)
    : false;
  const whyBullets = topMatch ? generateWhyBullets(topMatch, view) : [];

  const sharesCost = view.spot * 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Nav */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent transition-colors"
        >
          ← <span className="text-accent">θ</span> Home
        </Link>
        <div className="flex-1 max-w-sm">
          <SearchBar compact />
        </div>
      </div>

      {/* Stock header */}
      <header className="flex flex-wrap items-baseline gap-x-5 gap-y-2 pb-5 border-b border-border">
        <h1 className="text-4xl font-bold">{view.symbol}</h1>
        <div className="text-2xl text-gray-300">${view.spot.toFixed(2)}</div>
        {view.ivAtm !== null && (
          <div className="text-sm text-gray-400">
            ATM IV{" "}
            <span className="text-white font-medium">{(view.ivAtm * 100).toFixed(1)}%</span>
          </div>
        )}
        {view.fiftyTwoWeekHigh && (
          <div className="text-sm text-gray-400">
            52w High{" "}
            <span className="text-white font-medium">${view.fiftyTwoWeekHigh.toFixed(2)}</span>
          </div>
        )}
        {earnings && (
          <div
            className={`text-sm font-medium flex items-center gap-1.5 ml-auto ${
              earnings.urgent
                ? "text-amber-400"
                : "text-gray-400"
            }`}
          >
            {earnings.urgent ? "⚠️" : "📅"} {earnings.text}
          </div>
        )}
      </header>

      {/* Risk tier selector */}
      <section className="space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-500">Risk Intent</div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(RISK_TIERS) as [RiskKey, typeof RISK_TIERS[RiskKey]][]).map(
            ([key, t]) => (
              <button
                key={key}
                onClick={() => setRiskKey(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  riskKey === key
                    ? "bg-accentDim/20 border-accent text-white"
                    : "bg-panel border-border text-gray-400 hover:border-gray-500"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
                {riskKey === key && (
                  <span className="text-[10px] text-accent ml-1">{t.keepPct} keep</span>
                )}
              </button>
            )
          )}
        </div>
        <div className="text-xs text-gray-500">
          {tier.deltaHint} · {tier.desc}
        </div>
      </section>

      {/* Option type tabs */}
      <section className="space-y-4">
        <div className="flex gap-1 bg-panel border border-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setOptType("put")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              optType === "put"
                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800/50"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            💵 Cash-Secured Put
          </button>
          <button
            onClick={() => setOptType("call")}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              optType === "call"
                ? "bg-sky-900/50 text-sky-300 border border-sky-800/50"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            📈 Covered Call
          </button>
        </div>

        {optType === "call" && (
          <div className="text-xs text-gray-500">
            Covered calls require 100 shares of {view.symbol} (~$
            {sharesCost.toLocaleString(undefined, { maximumFractionDigits: 0 })})
          </div>
        )}
      </section>

      {/* Expiration picker */}
      {availableExps.length > 0 && (
        <section className="space-y-2">
          <div className="text-xs uppercase tracking-wider text-gray-500">Expiration</div>
          <div className="flex flex-wrap gap-2">
            {availableExps.map((exp) => {
              const dte = dteDays(exp);
              return (
                <button
                  key={exp}
                  onClick={() => setSelectedExp(exp)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all border ${
                    selectedExp === exp
                      ? "bg-accent/10 border-accent text-accent font-medium"
                      : "border-border text-gray-400 hover:border-gray-500 bg-panel"
                  }`}
                >
                  {fmtExp(exp)}{" "}
                  <span className="text-[11px] opacity-70">{dte}d</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Top Match */}
      {topMatch ? (
        <section className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-gray-500">Top Match</div>
          <div className="bg-[#0d1f18] border border-accent/40 rounded-xl p-5 space-y-4">
            {/* Match header */}
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                    🎯 Recommended
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mt-1">
                  ${topMatch.strike}{" "}
                  <span className="text-base font-normal text-gray-400 capitalize">
                    {topMatch.type}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-0.5">
                  Exp {fmtExp(topMatch.expiration)} · {topMatch.dte} DTE
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-accent">
                  {topMatch.annYieldPct.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">annualized</div>
              </div>
            </div>

            {/* Warnings */}
            <div className="space-y-2">
              {earningsBefore && (
                <Warning
                  text={`Earnings on ${fmtDate(view.earningsDate!)} fall before expiry — expect a large price move, elevated IV, and increased assignment risk`}
                  level="warn"
                />
              )}
              {!earningsBefore && view.earningsDate && (
                <Warning
                  text={`Earnings on ${fmtDate(view.earningsDate!)} fall after expiry — no earnings event risk in this trade`}
                  level="info"
                />
              )}
              {view.fiftyTwoWeekHigh &&
                optType === "call" &&
                topMatch.strike < view.fiftyTwoWeekHigh && (
                  <Warning
                    text={`Strike $${topMatch.strike} is below the 52-week high of $${view.fiftyTwoWeekHigh.toFixed(2)} — elevated assignment risk if the stock revisits highs`}
                    level="warn"
                  />
                )}
              {view.ivAtm && view.ivAtm > 0.6 && (
                <Warning
                  text={`High implied volatility (${(view.ivAtm * 100).toFixed(0)}% ATM IV) — premium is elevated but so is the expected move`}
                  level="warn"
                />
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <StatBox label="Premium" value={`$${topMatch.mid.toFixed(2)}`} />
              <StatBox label="Total" value={`$${topMatch.credit.toFixed(0)}`} highlight />
              <StatBox label="Return" value={`${topMatch.yieldPct.toFixed(2)}%`} />
              <StatBox
                label="Delta"
                value={Math.abs(topMatch.delta).toFixed(2)}
              />
              <StatBox
                label="Cushion"
                value={`$${topMatch.cushion.toFixed(2)}`}
                sub={`${topMatch.cushionPct.toFixed(1)}%`}
              />
              <StatBox
                label="Keep Prob"
                value={`~${(topMatch.pop * 100).toFixed(0)}%`}
                highlight
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatBox
                label="Implied Vol"
                value={`${(topMatch.iv * 100).toFixed(1)}%`}
              />
              <StatBox
                label="Theta / Day"
                value={`$${(topMatch.thetaDay * 100).toFixed(2)}`}
                sub="per contract"
              />
              <StatBox
                label="Breakeven"
                value={`$${topMatch.breakeven.toFixed(2)}`}
              />
            </div>

            {/* Why this trade */}
            <div className="border-t border-accentDim/20 pt-3">
              <button
                onClick={() => setWhyOpen((o) => !o)}
                className="flex items-center gap-2 text-sm text-accent hover:text-emerald-300 transition-colors"
              >
                <span className="text-gray-400">🔍</span>
                Why this trade?
                <span className="text-xs text-gray-500">{whyOpen ? "▲" : "▼"}</span>
              </button>
              {whyOpen && (
                <ul className="mt-3 space-y-2">
                  {whyBullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-accent mt-0.5 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="text-sm text-gray-500 border border-border bg-panel rounded-lg p-5">
          No {optType} candidates match the selected expiration and risk tier. Try a different
          expiration or risk level.
        </div>
      )}

      {/* Compare Strikes */}
      {compareStrikes.length > 0 && (
        <section className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-gray-500">Compare Strikes</div>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-panel text-gray-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Strike</th>
                  <th className="text-right px-3 py-3">Premium</th>
                  <th className="text-right px-3 py-3">Total</th>
                  <th className="text-right px-3 py-3">Return</th>
                  <th className="text-right px-3 py-3">Ann.</th>
                  <th className="text-right px-3 py-3">Delta</th>
                  <th className="text-right px-3 py-3">Cushion</th>
                  <th className="text-right px-3 py-3">IV</th>
                  <th className="text-right px-4 py-3">Keep %</th>
                </tr>
              </thead>
              <tbody>
                {compareStrikes.map((c, i) => {
                  const isMatch = topMatch && c.strike === topMatch.strike && c.expiration === topMatch.expiration;
                  return (
                    <tr
                      key={i}
                      className={`border-t border-border transition-colors ${
                        isMatch
                          ? "bg-accent/5 border-l-2 border-l-accent"
                          : "hover:bg-[#16161a]"
                      }`}
                    >
                      <td className="px-4 py-2.5 font-semibold">
                        ${c.strike}
                        {isMatch && (
                          <span className="ml-1.5 text-[10px] text-accent">✓</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-300">
                        ${c.mid.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-accent font-medium">
                        ${c.credit.toFixed(0)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-300">
                        {c.yieldPct.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-white">
                        {c.annYieldPct.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-400">
                        {Math.abs(c.delta).toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-400">
                        ${c.cushion.toFixed(0)}{" "}
                        <span className="text-[11px] text-gray-600">
                          ({c.cushionPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-400">
                        {(c.iv * 100).toFixed(1)}%
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right font-medium ${
                          c.pop >= 0.75
                            ? "text-emerald-400"
                            : c.pop >= 0.60
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        ~{(c.pop * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-600">
            Sorted by assignment risk (highest first). ✓ marks the recommended strike for your
            selected risk tier.
          </p>
        </section>
      )}
    </div>
  );
}
