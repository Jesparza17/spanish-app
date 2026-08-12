import type { Config } from "tailwindcss";

// Palette grounded in the subject: cempasúchil marigold (the flower strung
// through Mexican literature and daily life) as the one warm accent, a deep
// agave teal as the secondary, on an unbleached-paper background — a
// notebook, not a dashboard.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F2E6",
        ink: {
          DEFAULT: "#22283A",
          shell: "#1B2032",
        },
        card: "#FFFFFF",
        marigold: {
          DEFAULT: "#E08D3C",
          dark: "#B5691F",
          light: "#FBE4CC",
        },
        agave: {
          DEFAULT: "#2F6F62",
          dark: "#1E4A41",
          light: "#D9EAE6",
        },
        line: "#DAD4C0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(34,40,58,0.06), 0 1px 1px rgba(34,40,58,0.04)",
        floating: "0 12px 24px -8px rgba(34,40,58,0.18), 0 4px 8px -2px rgba(34,40,58,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
