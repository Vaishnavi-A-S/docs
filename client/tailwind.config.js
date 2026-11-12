/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#1a73e8', // Google Docs blue
          600: '#1557b0',
          700: '#10448a'
        }
      }
    },
  },
  plugins: [],
}
