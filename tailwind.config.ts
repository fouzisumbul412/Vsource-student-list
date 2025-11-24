import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#dc2626"
        },
        secondary: {
          DEFAULT: "#1e73be"
        }
      },
      container: {
        center: true,
        padding: "1rem"
      }
    }
  },
  plugins: []
};

export default config;
