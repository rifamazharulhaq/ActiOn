/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./script/**/*.js"],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a', surface: '#111111', card: '#181818', border: '#252525',
        red: { DEFAULT: '#E63946', dim: '#7a1a20', glow: 'rgba(230,57,70,.35)' },
        white: '#FFFFFF', muted: '#A0A0A0', win: '#22c55e', lose: '#E63946',
      },
      fontFamily: {
        head: ['"Barlow Condensed"', 'sans-serif'],
        ui: ['"Rajdhani"', 'sans-serif'],
        body: ['"Barlow"', 'sans-serif'],
      }
    }
  },
  plugins: [],
}