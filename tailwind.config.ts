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
          DEFAULT: "#1F1B1B",
          card:    "#2A2424",
          card2:   "#332C2C",
          border:  "rgba(255,255,255,0.08)",
        },
        mint: {
          light:   "#BE4459",
          DEFAULT: "#A4243B",
          dark:    "#7A1B2E",
          rose:    "#D9909B", // accent on dark surfaces
        },
        teal: {
          deep:  "#4A1522",
          mid:   "#C08691",
        },
        ink: {
          DEFAULT:   "#1F1B1B",
          secondary: "#6B6360",
          muted:     "#857C78",
        },
        // keep "brand" alias pointing to mint so existing code doesn't break
        brand: {
          DEFAULT: "#A4243B",
          light:   "#BE4459",
          dark:    "#7A1B2E",
          50:      "#FBF3F2",
          100:     "#F7E9E8",
          900:     "#1F1B1B",
        },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #3A1520 0%, #4A1522 50%, #1F1B1B 100%)",
        "mint-gradient": "linear-gradient(180deg, #BE4459 0%, #A4243B 100%)",
        "dark-card":     "linear-gradient(145deg, #2A2424 0%, #1F1B1B 100%)",
      },
      borderRadius: {
        pill: "120px",
        card: "20px",
        tag:  "999px",
      },
      boxShadow: {
        card:        "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)",
        "card-hover":"0 8px 32px rgba(0,0,0,0.08)",
        mint:        "0 6px 24px rgba(164,36,59,0.30)",
        glow:        "0 0 40px rgba(164,36,59,0.20)",
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
