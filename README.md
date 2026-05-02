# Theta Farm

A public web tool that scans liquid US optionable stocks for the highest-yield short-premium plays (cash-secured puts and covered calls).

## Features (v0.1 MVP)
- **Search** any ticker → see ranked CSP and covered-call candidates with credit, IV, delta, POP, breakeven, annualized yield.
- **Top IV Picks** on home — daily-refreshed leaderboard across ~70 liquid names.
- Filters: 25–55 DTE, delta 0.10–0.35, OI ≥ 100, OTM only.
- 10-minute server-side cache; per-ticker 5-minute cache.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Yahoo Finance via `yahoo-finance2` (free, delayed)
- Black-Scholes delta computed locally

## Run
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Roadmap
- IV Rank (needs daily IV history → Postgres)
- Earnings filter
- Spreads / iron condors
- Watchlist + email alerts
- Swap Yahoo for Polygon (license allows public redistribution)
- Rate limiting + abuse protection
- Backtester

## Disclaimer
Educational only. Not financial advice. Data is delayed and may be inaccurate.
