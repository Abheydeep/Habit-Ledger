import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f8faf6",
        mist: "#e4f3ee",
        teal: "#0f766e",
        ink: "#142f2b",
        blue: "#2563eb",
        saffron: "#f59e0b",
        line: "#d8e3de"
      },
      boxShadow: {
        sticker: "0 18px 38px rgba(15, 47, 43, 0.12)",
        panel: "0 20px 60px rgba(15, 47, 43, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
