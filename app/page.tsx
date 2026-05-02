import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import Mascot from "@/components/Mascot";
import { getTickerView } from "@/lib/options";
import type { TickerView, Candidate } from "@/lib/options";

export const revalidate = 600;

const FEATURED = ["NVDA", "AAPL", "SPY", "TSLA", "AMZN"];

const POPULAR = ["MSFT", "AMD", "PLTR", "COIN", "META", "GOOG", "AVGO", "QQQ"];

function earningsLabel(earningsDate: string | null): { text: string; urgent: boolean } | null {
  if (!earningsDate) return null;
  const ts = new Date(earningsDate).getTime();
  const days = Math.ceil((ts - Date.now()) / 86_400_000);
  if (days < 0) return null;
  if (days === 0) return { text: "Earnings today", urgent: true };
  if (days <= 7) return { text: `Earnings in ${days}d`, urgent: true };
  const d = new Date(earningsDate);
  return {
    text: `Earnings ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    urgent: false,
  };
}

function FeaturedCard({
  view,
  pick,
}: {
  view: TickerView;
  pick: Candidate;
}) {
  const earnings = earningsLabel(view.earningsDate);
  const isCall = pick.type === "call";

  return (
    <Link
      href={`/t/${view.symbol}`}
      className="group block bg-panel border border-border rounded-xl p-4 hover:border-accent transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-white group-hover:text-accent transition-colors">
            {view.symbol}
          </div>
          <div className="text-sm text-gray-400">${view.spot.toFixed(2)}</div>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
            isCall
              ? "bg-sky-900/40 text-sky-300 border border-sky-800/40"
              : "bg-emerald-900/40 text-emerald-300 border border-emerald-800/40"
          }`}
        >
          {pick.type}
        </span>
      </div>

      {/* Earnings badge */}
      {earnings && (
        <div
          className={`text-[11px] mb-3 flex items-center gap-1 ${
            earnings.urgent ? "text-amber-400" : "text-gray-500"
          }`}
        >
          {earnings.urgent ? "⚠️" : "📅"} {earnings.text}
        </div>
      )}

      {/* Main stat */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-0.5">${pick.strike} strike</div>
        <div className="text-3xl font-bold text-accent leading-none">
          {pick.annYieldPct.toFixed(1)}%
        </div>
        <div className="text-[11px] text-gray-500 mt-0.5">annualized yield</div>
      </div>

      {/* Footer stats */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 pt-2 border-t border-border">
        <span>{pick.dte}d exp</span>
        <span>Δ {Math.abs(pick.delta).toFixed(2)}</span>
        <span>{pick.cushionPct.toFixed(1)}% cushion</span>
      </div>
    </Link>
  );
}

export default async function Home() {
  const views = await Promise.all(
    FEATURED.map((s) => getTickerView(s).catch(() => null))
  );

  const featuredCards = views
    .map((v, i) => {
      if (!v || !v.candidates.length) return null;
      const pick = v.candidates.find(
        (c) => c.type === "put" && Math.abs(c.delta) >= 0.12 && Math.abs(c.delta) <= 0.32
      ) ?? v.candidates.find((c) => c.type === "put");
      if (!pick) return null;
      return { symbol: FEATURED[i], view: v, pick };
    })
    .filter(Boolean) as Array<{ symbol: string; view: TickerView; pick: Candidate }>;

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="grid md:grid-cols-[1fr_260px] gap-8 items-center pt-4">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-accent border border-accentDim/60 bg-accentDim/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live · refreshes every 10 min
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Plant premium.
              <br />
              <span className="text-accent">Harvest theta.</span>
            </h1>
            <p className="text-gray-400 text-lg mt-3 max-w-lg">
              Find the best cash-secured puts and covered calls across liquid US
              stocks — ranked, analyzed, and explained.
            </p>
          </div>
          <SearchBar />
          <div className="space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Popular</div>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((s) => (
                <Link
                  key={s}
                  href={`/t/${s}`}
                  className="text-xs px-2.5 py-1 bg-panel border border-border rounded-md hover:border-accent hover:text-accent transition-colors text-gray-400"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          <Mascot size={240} />
        </div>
      </section>

      {/* FEATURED PICKS */}
      <section className="space-y-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold">Featured Today</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Best put opportunity on each ticker — click any card to dive deeper.
            </p>
          </div>
        </div>

        {featuredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {featuredCards.map(({ view, pick }) => (
              <FeaturedCard key={view.symbol} view={view} pick={pick} />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm border border-border bg-panel rounded-lg p-5">
            Market data is loading — check back in a moment.
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      <section className="grid md:grid-cols-3 gap-4">
        <InfoCard
          icon="🌱"
          title="Cash-Secured Puts"
          body="Sell the right to buy shares at a lower price. Collect premium upfront; only buy if assigned. Great for stocks you'd own anyway."
        />
        <InfoCard
          icon="🌾"
          title="Covered Calls"
          body="Own 100 shares and sell the right to buy them at a higher price. Earn premium every cycle while holding your position."
        />
        <InfoCard
          icon="⏳"
          title="Theta Is Your Edge"
          body="Every day that passes, short option premium decays — and the decay accelerates near expiry. Time works for the seller."
        />
      </section>

      {/* FILTER CHIPS */}
      <section className="flex flex-wrap gap-2 text-xs text-gray-500 border-t border-border pt-6">
        <span className="text-gray-600">Screener defaults:</span>
        {["5–60 DTE", "Δ 0.08–0.45", "OTM only", "OI ≥ 10", "~75 liquid tickers"].map((t) => (
          <span key={t} className="px-2 py-1 bg-panel border border-border rounded">
            {t}
          </span>
        ))}
      </section>
    </div>
  );
}

function InfoCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="border border-border bg-panel rounded-xl p-5 hover:border-accentDim transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{body}</p>
    </div>
  );
}
