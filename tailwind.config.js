/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
        },
        elderly: {
          bg: "#0f172a",
          card: "#1e293b",
          highlight: "#fbbf24",
          taken: "#10b981",
          missed: "#ef4444",
        }
      },
      fontSize: {
        "accessible-lg": ["1.35rem", { lineHeight: "1.75rem" }],
        "accessible-xl": ["1.75rem", { lineHeight: "2.25rem" }],
        "accessible-2xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "accessible-3xl": ["3rem", { lineHeight: "3.5rem" }],
      }
    },
  },
  plugins: [],
};
