/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#475569',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        'card-bg': '#FFFFFF',
        'list-bg': '#F1F5F9',
        'board-bg': '#F8FAFC',
        'dark-blue': '#1E3A8A',
        'dark-blue-hover': '#1E40AF',
      }
    },
  },
  plugins: [],
}
