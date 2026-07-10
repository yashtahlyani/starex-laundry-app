import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading:  ["Poppins", "system-ui", "sans-serif"],
        body:     ["Kodchasan", "Inter", "system-ui", "sans-serif"],
        sans:     ["Kodchasan", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          DEFAULT: "#111921",
          card:    "#1a2332",
          card2:   "#32373B",
          border:  "rgba(255,255,255,0.08)",
        },
        mint: {
          light:   "#C9F8DE",
          DEFAULT: "#78EDB2",
          dark:    "#4ECDA0",
        },
        teal: {
          deep:  "#0a3547",
          mid:   "#1b8fc0",
        },
        ink: {
          DEFAULT:   "#09090B",
          secondary: "#52525B",
          muted:     "#71717A",
        },
        // keep "brand" alias pointing to mint so existing code doesn't break
        brand: {
          DEFAULT: "#78EDB2",
          light:   "#C9F8DE",
          dark:    "#4ECDA0",
          50:      "#f0fdf4",
          100:     "#dcfce7",
          900:     "#111921",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0a1e14 0%, #0a3547 50%, #111921 100%)",
        "mint-gradient": "linear-gradient(180deg, #C9F8DE 0%, #78EDB2 100%)",
        "dark-card":     "linear-gradient(145deg, #1a2332 0%, #111921 100%)",
      },
      borderRadius: {
        pill: "120px",
        card: "20px",
        tag:  "999px",
      },
      boxShadow: {
        card:        "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
        "card-hover":"0 8px 32px rgba(0,0,0,0.08)",
        mint:        "0 6px 24px rgba(120,237,178,0.30)",
        glow:        "0 0 40px rgba(120,237,178,0.20)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up":       "fade-up 0.6s ease-out forwards",
        "fade-up-delay": "fade-up 0.6s ease-out 0.2s forwards",
        "fade-in":       "fade-in 0.4s ease-out forwards",
        float:           "float 3s ease-in-out infinite",
        marquee:         "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
