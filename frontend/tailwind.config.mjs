/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#193E33',
          light: '#285845',
          dark: '#12372D',
        },
        accent: {
          DEFAULT: '#2B6651',
          light: '#39785C',
          dark: '#194B3C',
        },
        success: '#2B6651',
        error: '#9B4D45',
        surface: {
          DEFAULT: '#F6F4ED',
          dark: '#E4EAE1',
          muted: '#DCE7DD',
        },
        text: {
          DEFAULT: '#193E33',
          muted: '#53665C',
          inverse: '#FFFDF7',
        },
      },
      fontFamily: {
        display: ['Cormorant', 'serif'],
        serif: ['Cormorant', 'Georgia', 'serif'],
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
