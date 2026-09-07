import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: { DEFAULT: "#4A0E0E", soft: "#641717", deep: "#300707" },
        brown: "#4A0E0E",
        gold: { DEFAULT: "#C9A96E", soft: "#E8D9B5" },
        cream: "#F5F5F2",
        whitesmoke: "#F5F5F2",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(74, 14, 14, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;