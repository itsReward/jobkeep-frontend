/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your Custom Blue Palette
        primary: {
          50: '#E3F2FD',    // Blue50
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#2962FF',    // BlueA700 - Main blue
          600: '#1E54C7',
          700: '#1A4DB0',
          800: '#164699',
          900: '#103D82',
          950: '#0A2A5C',
        },
        // Secondary - Electric Blue variants
        secondary: {
          50: '#F0F0FF',
          100: '#E6E6FF',
          200: '#D9D9FF',
          300: '#C6C6F5',
          400: '#B3B3F3',    // ElectricBlue
          500: '#9999E6',
          600: '#7F7FD9',
          700: '#6666CC',
          800: '#4D4DBF',
          900: '#3333B3',
          950: '#1A1A66',
        },
        // Accent Blue
        accent: {
          50: '#EEF4FF',
          100: '#DCE9FF',
          200: '#B8D4FF',
          300: '#94BFFF',
          400: '#7AABFF',
          500: '#5D88FF',    // BlueA60
          600: '#4A6FCC',
          700: '#3E5CA3',
          800: '#32497A',
          900: '#263651',
          950: '#1A2329',
        },
        // Dark Blue variant
        darkBlue: {
          50: '#F2F5FF',
          100: '#E5EBFE',
          200: '#D1DBFD',
          300: '#A8BBFA',
          400: '#8FA5F1',
          500: '#6E8BD8',    // DarkBlue
          600: '#5A73B8',
          700: '#4A6098',
          800: '#3A4D78',
          900: '#2A3958',
          950: '#1D2640',
        },
        // Success green (keeping original for consistency)
        success: {
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
        },
        // Warning amber (keeping original)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Error red (keeping original)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Neutral grays (updated for better contrast with blues)
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(41, 98, 255, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(41, 98, 255, 0.6)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(41, 98, 255, 0.3)',
        'glow': '0 0 20px rgba(41, 98, 255, 0.4)',
        'glow-lg': '0 0 40px rgba(41, 98, 255, 0.5)',
        'glass': '0 8px 32px rgba(41, 98, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'vibrant': '0 20px 40px rgba(41, 98, 255, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}