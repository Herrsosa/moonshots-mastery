import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#05060F",
          panel: "#0B0E1F",
          card: "#0F1430",
          line: "#1B2148",
        },
        node: {
          available: "#A855F7",
          progress: "#22D3EE",
          mastered: "#22C55E",
          energy: "#F59E0B",
        },
        ink: {
          DEFAULT: "#E6E8F2",
          dim: "#8C90AE",
          faint: "#5A5F82",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 24px rgba(34,211,238,0.55), 0 0 56px rgba(34,211,238,0.25)",
        "glow-purple": "0 0 24px rgba(168,85,247,0.55), 0 0 56px rgba(168,85,247,0.25)",
        "glow-green": "0 0 24px rgba(34,197,94,0.55), 0 0 56px rgba(34,197,94,0.25)",
        "glow-amber": "0 0 24px rgba(245,158,11,0.65), 0 0 56px rgba(245,158,11,0.3)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { filter: "drop-shadow(0 0 6px currentColor)" },
          "50%": { filter: "drop-shadow(0 0 20px currentColor)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
        drawLine: "drawLine 1.4s ease-out forwards",
        floatY: "floatY 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
