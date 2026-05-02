"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SUGGESTIONS = ["AAPL", "NVDA", "TSLA", "SPY", "AMD", "COIN", "PLTR", "META"];

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = () => {
    const sym = q.trim().toUpperCase();
    if (sym) router.push(`/t/${sym}`);
  };

  if (compact) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex gap-2 w-full"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker…"
            className="w-full bg-panel border border-border rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-black text-sm font-semibold px-3 rounded-md hover:bg-emerald-400 transition-colors"
        >
          Go
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-2 w-full max-w-xl">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search any ticker — AAPL, NVDA, SPY…"
            className="w-full bg-panel border border-border rounded-md pl-9 pr-4 py-3 text-base focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          type="submit"
          className="bg-accent text-black font-semibold px-6 rounded-md hover:bg-emerald-400 transition-colors"
        >
          Analyze →
        </button>
      </form>
      <div className="flex gap-2 text-xs text-gray-500 items-center flex-wrap">
        <span>Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => router.push(`/t/${s}`)}
            className="px-2 py-0.5 bg-panel border border-border rounded hover:border-accent hover:text-accent transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
