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
        ayucare: {
          teal: {
            DEFAULT: "#174D46",
            50: "#F2F7F6",
            100: "#E1EDEB",
            200: "#C3DBD7",
            300: "#8FAFA9",
            400: "#4D827A",
            500: "#174D46",
            600: "#13423C",
            700: "#0F3430",
            800: "#0A2421",
            900: "#061816",
          },
          sage: {
            DEFAULT: "#8EAA98",
            50: "#F5F8F6",
            100: "#E5EDE8",
            200: "#C9DBD0",
            300: "#ACC7B7",
            400: "#8EAA98",
            500: "#6F917B",
            600: "#55745F",
          },
          ivory: {
            DEFAULT: "#F7F7F2",
            50: "#FCFCFA",
            100: "#F7F7F2",
            200: "#EDEDE4",
            300: "#DFDFD2",
          },
          charcoal: {
            DEFAULT: "#202B29",
            50: "#F4F5F5",
            100: "#E4E6E5",
            500: "#737D79",
            700: "#3D4846",
            900: "#202B29",
          },
          success: "#2E7D32",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
