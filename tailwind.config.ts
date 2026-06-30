import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#070A12",
        night: "#0B1020",
        electric: "#6D5DFB",
        cyan: "#1EE7F2"
      },
      boxShadow: {
        glow: "0 0 60px rgba(109, 93, 251, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
