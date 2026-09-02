/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B4332",
          dark: "#12302340",
          50: "#E9F1EC",
          100: "#CFE2D6",
          600: "#1B4332",
          700: "#153627",
          900: "#0D211A"
        },
        parchment: "#FAF7F0",
        amber: {
          DEFAULT: "#C08A2E",
          50: "#FBF3E4"
        },
        clay: "#B3492C",
        slate: {
          ink: "#2B2E33"
        }
      },
      fontFamily: {
        display: ["Newsreader", "serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"]
      }
    }
  },
  plugins: []
};
