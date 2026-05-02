"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = [
  500, 1000, 2500, 5000, 10000, 25000, 50000,
  100000, 250000, 500000, 1_000_000,
];

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}K`;
  return `$${n}`;
}

export default function CapitalSlider({ initial = 10000 }: { initial?: number }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const initIdx = STEPS.findIndex((v) => v >= initial);
  const [idx, setIdx] = useState(initIdx >= 0 ? initIdx : 4);
  const value = STEPS[idx];

  // Debounced URL update
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.set("capital", String(value));
      router.replace(`${path}?${next.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-panel border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Available capital</div>
          <div className="text-3xl font-bold text-accent">{fmtMoney(value)}</div>
        </div>
        <div className="text-xs text-gray-500 max-w-[40%] text-right">
          Recommendations are filtered to plays your account can collateralize.
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{fmtMoney(STEPS[0])}</span>
        <span>{fmtMoney(STEPS[Math.floor(STEPS.length / 2)])}</span>
        <span>{fmtMoney(STEPS[STEPS.length - 1])}</span>
      </div>
    </div>
  );
}
