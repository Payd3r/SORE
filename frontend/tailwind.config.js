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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        ios: {
          blue: '#0A84FF',
          green: '#30D158',
          red: '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          gray: '#8E8E93',
          bg: '#F2F2F7',
          card: '#FFFFFF',
          darkBg: '#000000',
          darkCard: '#1C1C1E',
        },
        sore: {
          primary: '#FF6B35',
          'primary-hover': '#E85A2A',
          'primary-active': '#D94E1F',
          accent: '#E91E63',
          'accent-blue': '#0A84FF',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter var', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ios-sm': '12px',
        'ios-md': '16px',
        'ios-lg': '20px',
        'ios-xl': '24px',
        card: '16px',
        'card-lg': '20px',
        input: '12px',
        'input-lg': '16px',
      },
      boxShadow: {
        'ios-card': '0 10px 30px -20px rgba(15, 23, 42, 0.45)',
        'ios-float': '0 16px 40px -24px rgba(2, 8, 23, 0.6)',
      },
      spacing: {
        'ios-edge': '16px',
        'ios-gap': '12px',
        'ios-touch': '44px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in',
        'slideDown': 'slideDown 0.5s ease-out',
        'slideUp': 'slideUp 0.5s ease-out',
        'slideLeft': 'slideLeft 0.5s ease-out',
        'slideRight': 'slideRight 0.5s ease-out',
        'scaleIn': 'scaleIn 0.5s ease-out',
        'gradientShift': 'gradientShift 8s ease infinite',
        'count': 'count 1s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        count: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 