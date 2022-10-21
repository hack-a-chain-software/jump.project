const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        diamond: "linear-gradient(90deg, #9795F0 0%, #FBC8D4 100%)",
      },
      screens: {
        mobile: "868px",
        tablet: "1180px",
        web: "1500px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  plugins: [require("@tailwindcss/line-clamp")],
};
