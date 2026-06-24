/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1C1917',
          light: '#44403C',
          dark: '#0C0A09',
        },
        accent: {
          DEFAULT: '#CA8A04',
          light: '#EAB308',
          dark: '#A16207',
        },
        surface: {
          DEFAULT: '#FAFAF9',
          dark: '#F5F5F4',
          muted: '#E7E5E4',
        },
        text: {
          DEFAULT: '#0C0A09',
          muted: '#78716C',
          inverse: '#FAFAF9',
        },
      },
      fontFamily: {
        display: ['Cormorant', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
