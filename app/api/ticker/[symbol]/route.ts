import { NextResponse } from "next/server";
import { getTickerView } from "@/lib/options";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } }
) {
  const sym = (params.symbol || "").toUpperCase().trim();
  if (!/^[A-Z.\-]{1,8}$/.test(sym)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }
  const view = await getTickerView(sym);
  if (!view) {
    return NextResponse.json({ error: "Not found or no options" }, { status: 404 });
  }
  return NextResponse.json(view);
}
