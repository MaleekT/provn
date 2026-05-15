import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#0A0F1E",
        "score-green": "#22C55E",
        "score-amber": "#F59E0B",
        "score-red": "#EF4444",
      },
    },
  },
  plugins: [],
};
export default config;
