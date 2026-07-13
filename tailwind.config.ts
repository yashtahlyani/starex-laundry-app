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
          DEFAULT: "#241619",
          card:    "#322225",
          card2:   "#3B2A2E",
          border:  "rgba(255,255,255,0.08)",
        },
        mint: {
          light:   "#DA6178",
          DEFAULT: "#CB3E5E",
          dark:    "#A82F4B",
          rose:    "#EBA3B4", // accent on dark surfaces
        },
        teal: {
          deep:  "#431E2C",
          mid:   "#C97F92",
        },
        ink: {
          DEFAULT:   "#241619",
          secondary: "#6E5F5C",
          muted:     "#8A7B77",
        },
        // keep "brand" alias pointing to mint so existing code doesn't break
        brand: {
          DEFAULT: "#CB3E5E",
          light:   "#DA6178",
          dark:    "#A82F4B",
          50:      "#FBF3F2",
          100:     "#F7E3E6",
          900:     "#241619",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #3A1C28 0%, #431E2C 50%, #241619 100%)",
        "mint-gradient": "linear-gradient(180deg, #DA6178 0%, #CB3E5E 100%)",
        "dark-card":     "linear-gradient(145deg, #322225 0%, #241619 100%)",
      },
      borderRadius: {
        pill: "120px",
        card: "20px",
        tag:  "999px",
      },
      boxShadow: {
        card:        "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
        "card-hover":"0 8px 32px rgba(0,0,0,0.08)",
        mint:        "0 6px 24px rgba(203,62,94,0.30)",
        glow:        "0 0 40px rgba(203,62,94,0.20)",
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
