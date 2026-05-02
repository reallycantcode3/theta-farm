import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0b",
        panel: "#111114",
        border: "#1f1f24",
        accent: "#10b981",
        accentDim: "#065f46",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
};
export default config;
