/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          dark: "#020617",
        },
        brand: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#3B82F6",
        },
        success: "#10B981",
        muted: "#475569",
        soft: "#F8FAFC",
        // ✅ ADDED — used by Badge + Button
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(15, 23, 42, 0.08)",
        cardHover: "0 8px 30px rgba(15, 23, 42, 0.15)",
        // ✅ ADDED — used by Button (brand glow)
        glow: "0 0 0 4px rgba(37, 99, 235, 0.15)",
      },
      // ✅ ADDED — used by marquee animation if needed
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};