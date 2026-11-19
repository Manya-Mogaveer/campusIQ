/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#94bddc',
          400: '#5e9bc7',
          500: '#387eb3',
          600: '#286395',
          700: '#214f79',
          800: '#1d4365',
          900: '#0f2438',
          navy: '#0a192f',
          dark: '#081220',
          accent: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
