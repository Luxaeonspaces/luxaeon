import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: { DEFAULT: "#5C1A1B", soft: "#7A2426", deep: "#4A1012" },
        gold: { DEFAULT: "#C9A96E", soft: "#E8D9B5" },
        cream: "#F8F5F0",
      },
      fontFamily: {
        sans: ["var(--font-dm)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(92, 26, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
