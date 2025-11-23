/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0079BF',
        secondary: '#5E6C84',
        success: '#61BD4F',
        danger: '#EB5A46',
        warning: '#F2D600',
        'card-bg': '#FFFFFF',
        'list-bg': '#EBECF0',
        'board-bg': '#0079BF',
      }
    },
  },
  plugins: [],
}
