/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
    keyframes: {
      'scroll-hint': {
        '0%, 50%': { opacity: '0', transform: 'translateX(0)' },       // Hidden for 5s
        '55%': { opacity: '0.8', transform: 'translateX(-4px)' },      // Start glowing
        '60%': { opacity: '1', transform: 'translateX(0)' },           // Brightest
        '70%': { opacity: '0.8', transform: 'translateX(4px)' },       // Soft wave
        '80%, 100%': { opacity: '0', transform: 'translateX(0)' },     // Fade out smoothly
      },
    },
    animation: {
      'scroll-hint': 'scroll-hint 10s ease-in-out infinite',
    },
  },
  },
  plugins: [],
}

