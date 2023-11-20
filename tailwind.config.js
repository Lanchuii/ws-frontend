/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '400px',
        'md': '768px',
        'lg': '1124px',
        'xl': '1300px',
      }, 
    },
  },
  plugins: [],
}

