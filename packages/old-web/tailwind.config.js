module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        red: {
          imperial: '#e63946ff',
        },
        honeydew: '#f1faeeff',
        blue: {
          powder: '#a8dadcff',
          celadon: '#457b9dff',
          prussian: '#1d3557ff',
        }
      },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
