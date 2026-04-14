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
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        futuristic: {
          bg: 'linear-gradient(135deg, #0f0f23 0%, #1a0033 50%, #2d1b69 100%)',
          glass: 'rgba(255, 255, 255, 0.1)',
          neon: '#00f5ff',
          accent: '#ff00ff',
          glow: '#00d4ff',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        'grotesk': ['Space Grotesk', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px #00f5ff40' },
          '100%': { boxShadow: '0 0 20px #00f5ff80, 0 0 40px #ff00ff40' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

