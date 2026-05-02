import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Theta Farm — Plant Premium, Harvest Theta",
  description:
    "The friendliest scanner for cash-secured puts and covered calls. Find the highest-yield option premium across liquid US stocks, free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-gray-200 antialiased">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <header className="border-b border-border bg-panel/80 backdrop-blur sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <span className="w-8 h-8 rounded-lg bg-accentDim/30 border border-accentDim flex items-center justify-center text-accent">
                θ
              </span>
              <span>Theta Farm</span>
              <span className="text-[10px] uppercase tracking-wider text-accent bg-accentDim/20 px-1.5 py-0.5 rounded ml-1">
                beta
              </span>
            </Link>
            <nav className="text-sm text-gray-400 flex gap-5">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/about" className="hover:text-white">Methodology</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

        <footer className="max-w-6xl mx-auto px-4 py-10 mt-16 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-gray-500">
            <div>
              <span className="text-accent">θ</span> Theta Farm · Educational tool only.
              Not financial advice. Data is delayed.
            </div>
            <div>Made with ☕ and 0.20 deltas.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
