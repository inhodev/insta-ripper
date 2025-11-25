/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'head': ['"Archivo Black"', 'sans-serif'],
        'body': ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        'nb-yellow': '#FFDE00',
        'nb-pink': '#FF6B6B',
        'nb-blue': '#4ECDC4',
        'nb-green': '#A3E635',
        'nb-bg': '#E0E7FF',
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
        'hard-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'hard-xl': '12px 12px 0px 0px rgba(0,0,0,1)',
      }
    },
  },
  plugins: [],
}
