/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B4B4',
          dark: '#009999',
        },
        secondary: {
          DEFAULT: '#FF8C00',
          dark: '#E67E00',
        },
        footer: '#004E89',
      },
      backgroundImage: {
        'funzia-gradient': 'linear-gradient(to right, #00B4B4, #7CFC00, #FFD700, #FF8C00)',
        'funzia-gradient-br': 'linear-gradient(to bottom right, #00B4B4, #7CFC00, #FFD700, #FF8C00)',
      },
    },
  },
  plugins: [],
}
