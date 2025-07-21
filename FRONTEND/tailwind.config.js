/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",          // your main html file
    "./src/**/*.{js,jsx,ts,tsx}", // all React components in src folder
  ],
  theme: {
    extend: {
      animation: {
        'in': 'in 0.3s ease-out',
        'slide-in-from-top-2': 'slide-in-from-top-2 0.3s ease-out',
      },
      keyframes: {
        'in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-from-top-2': {
          '0%': { opacity: '0', transform: 'translateY(-0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
