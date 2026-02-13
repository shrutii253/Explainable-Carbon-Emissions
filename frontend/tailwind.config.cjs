/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfdf3",
          100: "#d1fae4",
          200: "#a7f3c7",
          300: "#6ee7a0",
          400: "#34d27a",
          500: "#16a559",
          600: "#158047",
          700: "#16603a",
          800: "#145033",
          900: "#052e16"
        }
      },
      boxShadow: {
        "soft-card":
          "0 18px 45px rgba(15, 23, 42, 0.55), 0 0 0 1px rgba(148, 163, 184, 0.08)"
      }
    }
  },
  plugins: []
};

