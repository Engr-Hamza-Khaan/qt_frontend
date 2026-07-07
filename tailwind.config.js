/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'sans-serif'],
        brush: ['"Rubik Wet Paint"', 'cursive'],
      },
      colors: {
        store: {
          primary: '#111827',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          surface: '#f9fafb',
          border: '#e5e7eb',
          muted: '#6b7280',
        },
        neon: {
          purple: '#b026ff',
          'purple-light': '#d946ef',
          'purple-dark': '#7c16c9',
        },
      },
      boxShadow: {
        'neon-purple': '0 0 30px rgba(176, 38, 255, 0.45)',
        'neon-purple-lg': '0 0 50px rgba(176, 38, 255, 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up-drawer': 'slideUpDrawer 0.3s ease-out',
        float: 'float 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUpDrawer: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
      },
    },
  },
  plugins: [],
}
