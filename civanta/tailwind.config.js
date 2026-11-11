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
        '2xs': ['0.78rem', { lineHeight: '1.15rem' }],
        xs: ['0.86rem', { lineHeight: '1.25rem' }],
        sm: ['0.95rem', { lineHeight: '1.4rem' }],
        base: ['1.05rem', { lineHeight: '1.6rem' }],
        lg: ['1.2rem', { lineHeight: '1.75rem' }],
        xl: ['1.4rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.7rem', { lineHeight: '2.2rem' }],
        '3xl': ['2.1rem', { lineHeight: '2.5rem' }],
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
