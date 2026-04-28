/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1B3A5C',
          mid: '#2C5F8A',
          orange: '#E86C00',
          teal: '#007B8A',
          green: '#1B7A3D',
          red: '#D43838',
        },
        surface: {
          blue: '#E8EFF7',
          green: '#E6F5EB',
          orange: '#FDF0E2',
          teal: '#E0F4F6',
          red: '#FDEBEB',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
          'Noto Sans Thai', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
