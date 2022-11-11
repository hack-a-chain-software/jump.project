module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        violet: "#6E3A85", // Wine Violet
        purple: "#431E5A", // Purple Jump
        black: {
          DEFAULT: "#000000", // Black
          200: "#000000B3", // Black Glass
        },
        green: "#559C71", // Soft Green
        blue: "#5E6DEC", // Soft Blue
        red: "#CE2828", // Soft Red
        jump: {
          100: "linear-gradient(90deg, #510B72 0%, #740B0B 100%);", // Jump Gradient
          200: "linear-gradient(90deg, #AE00FF 0%, #FF1100 100%);", // Jump Gradient 2
        },
        white: {
          DEFAULT: "#FFFFFF", // White
          200: "#E2E8F0", // Gray
          300: "#FFFFFFBF", // Transparent White 2
          400: "#FFFFFF80", // Transparent White
          500: "#FCFCFC33", // Glass 1
          600: "#FFFFFF1A", // Glass 2
        },
      },
      borderRadius: {
        none: 0,
        sm: ".625rem",
        lg: "1.25rem",
      },
      lineHeight: "1",
      letterSpacing: "-.03rem",
      animation: {
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
      keyframes: {
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
};
