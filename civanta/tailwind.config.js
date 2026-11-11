/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14213D',
          hover: '#1e2e50',
          subtle: '#e8ecf4',
          900: '#14213D',
          950: '#0d1527',
        },
        police: {
          50: '#f0f4f9',
          100: '#d9e2f0',
          200: '#b4c7e3',
          300: '#84a5d1',
          400: '#5380bd',
          500: '#3464a4',
          600: '#264e86',
          700: '#14213D', // Primary Navy
          800: '#101a30',
          900: '#0b1222',
          950: '#060a14',
        },
        attention: {
          DEFAULT: '#D97706',
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
        },
        overdue: {
          DEFAULT: '#B91C1C',
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
        },
        resolved: {
          DEFAULT: '#15803D',
          bg: '#f0fdf4',
          border: '#bbf7d0',
          text: '#166534',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['1.17rem', { lineHeight: '1.65rem' }],
        xs: ['1.29rem', { lineHeight: '1.85rem' }],
        sm: ['1.425rem', { lineHeight: '2.05rem' }],
        base: ['1.575rem', { lineHeight: '2.3rem' }],
        lg: ['1.8rem', { lineHeight: '2.55rem' }],
        xl: ['2.1rem', { lineHeight: '2.85rem' }],
        '2xl': ['2.55rem', { lineHeight: '3.25rem' }],
        '3xl': ['3.15rem', { lineHeight: '3.75rem' }],
        '4xl': ['3.6rem', { lineHeight: '4.2rem' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '6px',
        xl: '6px',
        '2xl': '6px',
        '3xl': '6px',
      }
    },
  },
  plugins: [],
}
