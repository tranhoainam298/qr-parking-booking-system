/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        available: '#22C55E',
        occupied: '#EF4444',
        reserved: '#F97316',
        maintenance: '#9CA3AF',
        pending: '#EAB308',
        completed: '#3B82F6',
      },
    },
  },
  plugins: [],
}
