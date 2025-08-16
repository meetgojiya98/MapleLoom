/** @type {import('tailwindcss').Config} */

// Optional plugin loader (won't break if not installed)
const tryLoad = (name) => {
  try { return require(name); } catch { return null; }
};
const typography = tryLoad('@tailwindcss/typography');

module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      fontFamily: {
        // Uses system stack; swap with Inter if you add it
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      // Helpful for subtle glows; we mostly use arbitrary shadows but these are handy too
      boxShadow: {
        glow: '0 10px 40px -10px rgba(99,102,241,.6)',
        card: '0 0 0 1px rgba(255,255,255,.04), 0 20px 60px -20px rgba(0,0,0,.6)',
      },
    },
  },
  plugins: [
    typography && typography,
  ].filter(Boolean),
};
