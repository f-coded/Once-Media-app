/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1B17B3",
        ink: "#1A1A1A",
        muted: "#8A8A8A",
        input: "#F3F3F3",
        line: "#E7E7E7",
      },
      borderRadius: {
        pill: "999px",
      },
      fontFamily: {
        ubuntu: ["Ubuntu_400Regular"],
        "ubuntu-medium": ["Ubuntu_500Medium"],
        "ubuntu-bold": ["Ubuntu_700Bold"],
      },
    },
  },
  plugins: [],
};
