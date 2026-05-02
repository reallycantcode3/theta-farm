import { getTickerView } from "@/lib/options";
import TickerAnalysis from "@/components/TickerAnalysis";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export const revalidate = 300;

export default async function TickerPage({
  params,
}: {
  params: { symbol: string };
}) {
  const sym = (params.symbol || "").toUpperCase().trim();

  if (!/^[A-Z.\-]{1,8}$/.test(sym)) {
    return <NotFound sym={sym} />;
  }

  const view = await getTickerView(sym);

  if (!view) {
    return <NotFound sym={sym} />;
  }

  return <TickerAnalysis view={view} />;
}

function NotFound({ sym }: { sym: string }) {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent transition-colors"
      >
        ← <span className="text-accent">θ</span> Home
      </Link>
      <SearchBar />
      <div className="text-gray-400">
        No data for <span className="font-mono text-white">{sym}</span>. It may
        not be optionable, or data is temporarily unavailable.
      </div>
    </div>
  );
}
