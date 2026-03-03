/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',      // indigo-500
        secondary: '#4f46e5',    // indigo-600
        'primary-light': '#eef2ff',
        'primary-dark': '#3730a3',
      },
    },
  },
  plugins: [],
}
