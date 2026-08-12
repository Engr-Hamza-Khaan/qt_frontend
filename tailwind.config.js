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
        bebas: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'Inter', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        store: {
          primary: '#050c38',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          surface: '#09133e',
          border: 'rgba(75, 125, 255, 0.25)',
          muted: '#94a3b8',
        },
        navy: {
          950: '#03071c',
          900: '#050c38',
          850: '#071044',
          800: '#0a1658',
          700: '#0e2270',
        },
        gaming: {
          ps: '#0070d1',
          psGlow: '#00539c',
          xbox: '#107c10',
          xboxGlow: '#0e6d0e',
          nintendo: '#e60012',
          nintendoGlow: '#b8000e',
        },
        neon: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#b026ff',
          'purple-light': '#d946ef',
          'purple-dark': '#7c16c9',
        },
      },
      boxShadow: {
        'navy-glow': '0 0 30px rgba(59, 130, 246, 0.45)',
        'ps-glow': '0 0 45px rgba(0, 112, 209, 0.55)',
        'xbox-glow': '0 0 45px rgba(16, 124, 16, 0.55)',
        'nintendo-glow': '0 0 45px rgba(230, 0, 18, 0.55)',
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
