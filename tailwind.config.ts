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
        ink: "#22283A",
        marigold: {
          DEFAULT: "#E08D3C",
          dark: "#B5691F",
        },
        agave: {
          DEFAULT: "#2F6F62",
          dark: "#1E4A41",
        },
        line: "#DAD4C0",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
