module.exports = {
  mode: 'jit',
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        // Primary color (purple)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
          DEFAULT: '#7c3aed', // purple-600
          'foreground': '#ffffff',
        },
        // Secondary color (green)
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          DEFAULT: '#16a34a', // green-600
          'foreground': '#ffffff',
        },
        // Background and foreground colors
        background: '#ffffff',
        foreground: '#1f2937', // gray-800
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1f2937',
        },
        // Muted colors for secondary text and borders
        muted: {
          DEFAULT: '#f3f4f6', // gray-100
          foreground: '#6b7280', // gray-500
        },
        // Extended Tailwind color palette
        // You can remove or modify these if you're not using them
        accent: {
          DEFAULT: '#f97316', // orange-500
          foreground: '#ffffff',
        },
        border: {
          DEFAULT: '#e5e7eb', // gray-200
        },
      },
      // Adding custom animations for the landing page
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  variants: {
    extend: {
      fill: ['hover'],
      opacity: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [],
}