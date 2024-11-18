/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        icongreen: '#59d95b'
      },
      boxShadow: {
        glow: '0 0 15px 5px rgba(0,0,0,0.2)'
      },
      borderColor: {
        greyborder: '#e5e7eb'
      },
      perspective: {
        '1000': '1000px',
      },
      tran: {
        'preserve-3d': 'preserve-3d',
      },
      backface: {
        hidden: 'hidden',
      },
    },
  },
  plugins: [],
}

