/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'lightest-blue': '#CEE0F4',
        'lighter-blue': '#859FC0',
        'dark-blue': '#315381',
        'darker-blue': '#193060',  
        'darkest-blue': '#050B1E',
        'new-green': '#25A18E',
        'new-red': '#D1495B',
        'new-black/40': '#0E141C',
      },
    },
  },
  plugins: [],
};
