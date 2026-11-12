/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ajaia: {
          navy: '#001d6b',
          navy2: '#001244',
          navy3: '#00091f',
          navy4: '#00060f',
          sky: '#97c2f8',
          skySoft: '#c4dcfb',
          paper: '#f1f7ff',
          muted: '#aebfe2',
          muted2: '#8093c4',
          line: 'rgba(151,194,248,.14)',
          line2: 'rgba(151,194,248,.26)',
          ink: '#0b2e8e'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fragment Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
