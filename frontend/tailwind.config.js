/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        midnight: {
          background: "#001220",
          point: "#00E0D0",
          card: "#002845",
          text: "#E0E0E0",
          accent: "#E7433C",
        },
      },
    },
  },
  plugins: [],
};
