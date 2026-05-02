export default function About() {
  return (
    <div className="prose prose-invert max-w-2xl space-y-5 text-gray-300">
      <h1 className="text-3xl font-bold text-white">Methodology</h1>
      <p>
        Theta Farm scans liquid US optionable stocks for the highest annualized yield on
        short premium — primarily cash-secured puts (CSPs) and covered calls (CCs).
      </p>

      <h2 className="text-xl font-semibold text-white mt-6">Filters</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><b>DTE:</b> 25–55 days to expiration (theta-farm sweet spot).</li>
        <li><b>Delta:</b> 0.10 – 0.35 (moderate-probability premium sellers).</li>
        <li><b>Open Interest:</b> ≥ 100 contracts (basic liquidity floor).</li>
        <li><b>OTM only:</b> ITM strikes excluded.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6">Metrics</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li><b>Credit:</b> mid price × 100 (premium received per contract).</li>
        <li><b>Collateral:</b> strike × 100 for puts; spot × 100 for covered calls.</li>
        <li><b>Yield %:</b> credit / collateral.</li>
        <li><b>Annualized %:</b> Yield × (365 / DTE) — for cross-DTE comparison.</li>
        <li><b>POP:</b> 1 − |delta| (rule-of-thumb probability of profit).</li>
        <li><b>Delta:</b> computed via Black-Scholes from spot, strike, IV, DTE (r ≈ 4%).</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6">Data</h2>
      <p>
        Quotes and option chains via Yahoo Finance (delayed). Results cached up to 10 minutes.
        IV Rank, earnings calendar, and a paid data feed are on the roadmap.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6">Disclaimer</h2>
      <p className="text-gray-400 text-sm">
        This site is for educational purposes only. Nothing on this site is financial, investment,
        legal, or tax advice. Options carry substantial risk and are not suitable for all investors.
        Past performance does not predict future results. Verify all data with your broker.
      </p>
    </div>
  );
}
