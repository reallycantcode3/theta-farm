import { NextResponse } from "next/server";
import { topPicks } from "@/lib/options";
import { UNIVERSE } from "@/lib/universe";

export const revalidate = 600; // 10 min ISR-style cache
export const dynamic = "force-dynamic";

let SCAN_CACHE: { at: number; data: any } | null = null;
const SCAN_TTL = 10 * 60 * 1000;

export async function GET() {
  if (SCAN_CACHE && Date.now() - SCAN_CACHE.at < SCAN_TTL) {
    return NextResponse.json(SCAN_CACHE.data);
  }
  const picks = await topPicks(UNIVERSE, 30);
  const data = { asOf: new Date().toISOString(), picks };
  SCAN_CACHE = { at: Date.now(), data };
  return NextResponse.json(data);
}
