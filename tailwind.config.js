/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta corporativa UCC (del logo oficial)
        'ucc-lima':       '#ccd617',
        'ucc-cyan':       '#03abc7',
        'ucc-sage':       '#e3e9dc',
        'ucc-gray':       '#5f5d5e',
        'ucc-green':      '#82bb2a',
        'ucc-sky':        '#82dbe8',
        'ucc-green-dark': '#5a8a1a',
        'ucc-cyan-dark':  '#027a91',
        'ucc-bg':         '#f7f8f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
