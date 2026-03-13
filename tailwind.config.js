/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos UCC
        'ucc-azul': {
          primary: '#003DA5',
          dark: '#002870',
          light: '#4A7BBA',
        },
        'ucc-naranja': {
          primary: '#FF6B35',
          light: '#FF8C5F',
          dark: '#E55A2B',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
