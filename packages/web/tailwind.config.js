module.exports = {
  important: true,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
  plugins: [require("@tailwindcss/line-clamp")],
};
