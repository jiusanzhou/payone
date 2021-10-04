module.exports = {
  mode: 'jit',
  purge: [
    './config/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        // 'main': "url('/bg-shapes.svg')",
      },
      backgroundSize: {
        'main': 'cover'
      },
      backgroundRepeat: {
        'main': 'repeat-x'
      },
      backgroundAttachment: {
        'main': 'scroll'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
