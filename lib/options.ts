// Yahoo Finance public HTTP endpoints. No API key required.
// /v7/finance/options/{symbol} returns quote + nearest expiration chain.
// /v7/finance/options/{symbol}?date={unix} returns chain for a specific expiration.

const YHEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "Accept": "application/json,text/plain,*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

type Session = { cookie: string; crumb: string; at: number };
let SESSION: Session | null = null;
const SESSION_TTL = 60 * 60 * 1000;

async function getSession(): Promise<Session | null> {
  if (SESSION && Date.now() - SESSION.at < SESSION_TTL) return SESSION;
  try {
    const r1 = await fetch("https://fc.yahoo.com/", {
      headers: YHEADERS, redirect: "manual",
    });
    const setCookies = r1.headers.getSetCookie?.() ?? [];
    const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
    if (!cookie) { console.warn("[session] no cookies from fc.yahoo.com"); return null; }
    const r2 = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
      headers: { ...YHEADERS, Cookie: cookie },
    });
    if (!r2.ok) { console.warn(`[session] crumb status ${r2.status}`); return null; }
    const crumb = (await r2.text()).trim();
    if (!crumb) return null;
    SESSION = { cookie, crumb, at: Date.now() };
    return SESSION;
  } catch (e: any) {
    console.warn("[session] failed:", e?.message);
    return null;
  }
}

export type Candidate = {
  symbol: string;
  spot: number;
  expiration: string;
  dte: number;
  strike: number;
  bid: number;
  ask: number;
  mid: number;
  iv: number;
  delta: number;
  pop: number;
  credit: number;
  collateral: number;
  yieldPct: number;
  annYieldPct: number;
  breakeven: number;
  openInterest: number;
  volume: number;
  type: "put" | "call";
  thetaDay: number;
  cushion: number;
  cushionPct: number;
};

export type TickerView = {
  symbol: string;
  spot: number;
  ivAtm: number | null;
  candidates: Candidate[];
  expirations: string[];
  asOf: string;
  earningsDate: string | null;
  earningsTimestamp: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
};

function ncdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

export function bsDelta(
  type: "put" | "call",
  S: number, K: number, T: number, iv: number, r = 0.04
): number {
  if (T <= 0 || iv <= 0 || S <= 0 || K <= 0) return 0;
  const d1 = (Math.log(S / K) + (r + 0.5 * iv * iv) * T) / (iv * Math.sqrt(T));
  return type === "call" ? ncdf(d1) : ncdf(d1) - 1;
}

export function popFromDelta(delta: number): number {
  return 1 - Math.abs(delta);
}

function dteDays(unixSec: number): number {
  return Math.max(1, Math.round((unixSec * 1000 - Date.now()) / 86_400_000));
}

async function yfetch(url: string): Promise<any | null> {
  const session = await getSession();
  const headers: Record<string, string> = { ...YHEADERS };
  let finalUrl = url;
  if (session) {
    headers["Cookie"] = session.cookie;
    finalUrl += (url.includes("?") ? "&" : "?") + "crumb=" + encodeURIComponent(session.crumb);
  }
  try {
    const res = await fetch(finalUrl, { headers, cache: "no-store" });
    if (!res.ok) {
      console.warn(`[yfetch] ${res.status} ${res.statusText} :: ${url}`);
      if (res.status === 401 || res.status === 403) SESSION = null;
      return null;
    }
    return await res.json();
  } catch (e: any) {
    console.warn(`[yfetch] threw: ${e?.message} :: ${url}`);
    return null;
  }
}

type CacheEntry = { at: number; data: TickerView };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000;

export async function getTickerView(symbol: string): Promise<TickerView | null> {
  symbol = symbol.toUpperCase();
  const cached = CACHE.get(symbol);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const base = `https://query2.finance.yahoo.com/v7/finance/options/${encodeURIComponent(symbol)}`;
  const root = await yfetch(base);
  const result = root?.optionChain?.result?.[0];
  if (!result) return null;

  const quote = result.quote ?? {};
  const spot = quote?.regularMarketPrice;
  if (typeof spot !== "number") return null;

  // Earnings: use earningsTimestamp or earningsTimestampEnd, only if in the future within 90 days
  const rawEarnings: number | undefined =
    quote.earningsTimestamp ?? quote.earningsTimestampEnd ?? undefined;
  const earningsInFuture = rawEarnings && rawEarnings * 1000 > Date.now();
  const earningsWithin90d = earningsInFuture && rawEarnings! * 1000 < Date.now() + 90 * 86_400_000;
  const earningsTimestamp: number | null = earningsWithin90d ? rawEarnings! : null;
  const earningsDate: string | null = earningsTimestamp
    ? new Date(earningsTimestamp * 1000).toISOString().slice(0, 10)
    : null;

  const fiftyTwoWeekHigh: number | null =
    typeof quote.fiftyTwoWeekHigh === "number" ? quote.fiftyTwoWeekHigh : null;
  const fiftyTwoWeekLow: number | null =
    typeof quote.fiftyTwoWeekLow === "number" ? quote.fiftyTwoWeekLow : null;

  const expUnix: number[] = result.expirationDates || [];
  const expirations = expUnix.map((u) => new Date(u * 1000).toISOString().slice(0, 10));

  const targetExps = expUnix.filter((u) => {
    const d = dteDays(u);
    return d >= 5 && d <= 60;
  }).slice(0, 5);

  const candidates: Candidate[] = [];
  let ivAtm: number | null = null;

  for (const exp of targetExps) {
    const data = await yfetch(`${base}?date=${exp}`);
    const r = data?.optionChain?.result?.[0];
    const opts = r?.options?.[0];
    if (!opts) continue;
    const expIso = new Date(exp * 1000).toISOString().slice(0, 10);
    const dte = dteDays(exp);
    const T = dte / 365;

    const calls = opts.calls || [];
    const puts = opts.puts || [];

    if (ivAtm === null) {
      const atmCall = calls.reduce((b: any, c: any) =>
        !b || Math.abs(c.strike - spot) < Math.abs(b.strike - spot) ? c : b, null);
      const atmPut = puts.reduce((b: any, p: any) =>
        !b || Math.abs(p.strike - spot) < Math.abs(b.strike - spot) ? p : b, null);
      const ivs = [atmCall?.impliedVolatility, atmPut?.impliedVolatility]
        .filter((v) => typeof v === "number" && v > 0) as number[];
      if (ivs.length) ivAtm = ivs.reduce((a, b) => a + b, 0) / ivs.length;
    }

    const processSide = (side: any[], type: "put" | "call") => {
      for (const o of side) {
        const iv = o.impliedVolatility;
        const bid = o.bid ?? 0;
        const ask = o.ask ?? 0;
        const mid = bid && ask ? (bid + ask) / 2 : (o.lastPrice ?? 0);
        const oi = o.openInterest ?? 0;
        const vol = o.volume ?? 0;
        if (!iv || iv <= 0 || !mid || mid <= 0) continue;
        if (oi < 10) continue;
        const delta = bsDelta(type, spot, o.strike, T, iv);
        const absD = Math.abs(delta);
        if (absD < 0.05 || absD > 0.45) continue;
        if (type === "put" && o.strike > spot) continue;
        if (type === "call" && o.strike < spot) continue;
        const collateral = type === "put" ? o.strike * 100 : spot * 100;
        const credit = mid * 100;
        const yieldPct = (credit / collateral) * 100;
        const annYieldPct = yieldPct * (365 / dte);
        const breakeven = type === "put" ? o.strike - mid : o.strike + mid;
        const thetaDay = mid / dte;
        const rawCushion = type === "put" ? spot - o.strike : o.strike - spot;
        const cushion = Math.max(0, rawCushion);
        const cushionPct = (cushion / spot) * 100;
        candidates.push({
          symbol, spot, expiration: expIso, dte,
          strike: o.strike, bid, ask, mid, iv, delta,
          pop: popFromDelta(delta), credit, collateral, yieldPct, annYieldPct,
          breakeven, openInterest: oi, volume: vol, type,
          thetaDay, cushion, cushionPct,
        });
      }
    };
    processSide(puts, "put");
    processSide(calls, "call");
  }

  candidates.sort((a, b) => b.annYieldPct - a.annYieldPct);
  const view: TickerView = {
    symbol, spot, ivAtm, candidates, expirations,
    earningsDate, earningsTimestamp, fiftyTwoWeekHigh, fiftyTwoWeekLow,
    asOf: new Date().toISOString(),
  };
  CACHE.set(symbol, { at: Date.now(), data: view });
  return view;
}

export type RiskTier = "Conservative" | "Balanced" | "Aggressive";
export type Recommendation = {
  tier: RiskTier;
  rationale: string;
  assignmentRisk: string;
  candidate: Candidate;
};

export function pickRecommendations(
  view: TickerView,
  side: "put" | "call",
  maxCollateral: number = Infinity,
): Recommendation[] {
  const pool = view.candidates.filter(
    (c) => c.type === side && c.collateral <= maxCollateral
  );
  if (!pool.length) return [];

  const used = new Set<string>();
  const usedExps = new Set<string>();

  const pickWithExpPreference = (targetDelta: number): Candidate | null => {
    let best: Candidate | null = null;
    let bestScore = Infinity;
    for (const c of pool) {
      if (used.has(c.expiration + ":" + c.strike)) continue;
      if (usedExps.has(c.expiration)) continue;
      const score = Math.abs(Math.abs(c.delta) - targetDelta);
      if (score < bestScore) { bestScore = score; best = c; }
    }
    if (best) return best;
    for (const c of pool) {
      if (used.has(c.expiration + ":" + c.strike)) continue;
      const score = Math.abs(Math.abs(c.delta) - targetDelta);
      if (score < bestScore) { bestScore = score; best = c; }
    }
    return best;
  };

  const sideWord = side === "put" ? "put" : "call";
  const moneyHint = "OTM";

  const tiers: { tier: RiskTier; delta: number; rationale: string; risk: string }[] = [
    {
      tier: "Conservative", delta: 0.12,
      rationale: `Far ${moneyHint} ${sideWord} — low chance of assignment. Steady, smaller premium.`,
      risk: "~12% historical chance of finishing ITM",
    },
    {
      tier: "Balanced", delta: 0.22,
      rationale: `Sweet-spot ${sideWord} strike — meaningful credit with manageable assignment odds.`,
      risk: "~22% historical chance of finishing ITM",
    },
    {
      tier: "Aggressive", delta: 0.32,
      rationale: `Closer-to-money ${sideWord}. Bigger premium, but expect occasional assignment.`,
      risk: "~32% historical chance of finishing ITM",
    },
  ];

  const recs: Recommendation[] = [];
  for (const t of tiers) {
    const c = pickWithExpPreference(t.delta);
    if (!c) continue;
    used.add(c.expiration + ":" + c.strike);
    usedExps.add(c.expiration);
    recs.push({ tier: t.tier, rationale: t.rationale, assignmentRisk: t.risk, candidate: c });
  }
  return recs;
}

export async function topPicks(symbols: string[], limit = 25): Promise<Candidate[]> {
  const results: Candidate[] = [];
  const BATCH = 5;
  for (let i = 0; i < symbols.length; i += BATCH) {
    const batch = symbols.slice(i, i + BATCH);
    const views = await Promise.all(batch.map((s) => getTickerView(s).catch(() => null)));
    for (const v of views) {
      if (!v || !v.candidates.length) continue;
      const best = v.candidates.find((c) => c.type === "put");
      if (best) results.push(best);
    }
  }
  results.sort((a, b) => b.annYieldPct - a.annYieldPct);
  return results.slice(0, limit);
}
