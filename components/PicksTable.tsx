import Link from "next/link";
import type { Candidate } from "@/lib/options";

const fmt = {
  pct: (n: number) => `${n.toFixed(2)}%`,
  num: (n: number, d = 2) => n.toFixed(d),
  money: (n: number) => `$${n.toFixed(2)}`,
  iv: (n: number) => `${(n * 100).toFixed(1)}%`,
};

export default function PicksTable({ picks }: { picks: Candidate[] }) {
  if (!picks.length) {
    return <div className="text-gray-500 py-8">No candidates found right now. Try again in a few minutes.</div>;
  }
  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-panel text-gray-400 text-xs uppercase">
          <tr>
            <th className="text-left px-3 py-2">Ticker</th>
            <th className="text-right px-3 py-2">Spot</th>
            <th className="text-left px-3 py-2">Type</th>
            <th className="text-right px-3 py-2">Strike</th>
            <th className="text-right px-3 py-2">Exp</th>
            <th className="text-right px-3 py-2">DTE</th>
            <th className="text-right px-3 py-2">Credit</th>
            <th className="text-right px-3 py-2">IV</th>
            <th className="text-right px-3 py-2">Δ</th>
            <th className="text-right px-3 py-2">POP</th>
            <th className="text-right px-3 py-2">Yield</th>
            <th className="text-right px-3 py-2">Ann %</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((c, i) => (
            <tr key={i} className="table-row border-t border-border">
              <td className="px-3 py-2 font-semibold">
                <Link href={`/t/${c.symbol}`} className="hover:text-accent">{c.symbol}</Link>
              </td>
              <td className="px-3 py-2 text-right">{fmt.money(c.spot)}</td>
              <td className="px-3 py-2 uppercase text-xs">
                <span className={c.type === "put" ? "text-emerald-400" : "text-sky-400"}>{c.type}</span>
              </td>
              <td className="px-3 py-2 text-right">{fmt.money(c.strike)}</td>
              <td className="px-3 py-2 text-right text-gray-400">{c.expiration}</td>
              <td className="px-3 py-2 text-right">{c.dte}</td>
              <td className="px-3 py-2 text-right">${c.credit.toFixed(0)}</td>
              <td className="px-3 py-2 text-right">{fmt.iv(c.iv)}</td>
              <td className="px-3 py-2 text-right">{c.delta.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{(c.pop * 100).toFixed(0)}%</td>
              <td className="px-3 py-2 text-right">{fmt.pct(c.yieldPct)}</td>
              <td className="px-3 py-2 text-right text-accent font-semibold">{fmt.pct(c.annYieldPct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
