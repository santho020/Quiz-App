/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#00FFB3',
        neonBlue: '#55DDFF',
        neonPink: '#FF6EC7',
        cardBg: '#0A0F1E'
      }
    }
  },
  plugins: []
};
