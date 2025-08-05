#!/bin/bash

# JobKeep Configuration Script
# This script configures Tailwind CSS, TypeScript, and creates base configuration files

echo "⚙️  Configuring JobKeep project..."
echo "================================="

# Configure Tailwind CSS
echo "🎨 Configuring Tailwind CSS..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blue color scheme
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Complementary orange (warm) colors
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // Success green
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
        // Warning amber
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
        // Error red
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
        // Neutral grays
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 40px -10px rgba(59, 130, 246, 0.6)',
      },
    },
  },
  plugins: [],
}
EOF

# Create TypeScript configuration
echo "📝 Configuring TypeScript..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"],
      "@/store/*": ["./src/store/*"],
      "@/assets/*": ["./src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create Vite configuration
echo "⚡ Configuring Vite..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/assets": path.resolve(__dirname, "./src/assets"),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
EOF

# Create environment files
echo "🌍 Creating environment files..."
cat > .env.example << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=JobKeep
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
EOF

cp .env.example .env.local

# Create main CSS file
echo "🎨 Creating global styles..."
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-gray-50 text-gray-900 font-sans;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold text-gray-900;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
  }

  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700;
  }

  .btn-secondary {
    @apply btn bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700;
  }

  .btn-outline {
    @apply btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100;
  }

  .btn-ghost {
    @apply btn text-gray-700 hover:bg-gray-100 active:bg-gray-200;
  }

  .btn-sm {
    @apply h-8 px-3 text-xs;
  }

  .btn-md {
    @apply h-10 px-4 text-sm;
  }

  .btn-lg {
    @apply h-12 px-6 text-base;
  }

  .card {
    @apply bg-white rounded-xl border border-gray-200 shadow-sm;
  }

  .input {
    @apply w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }

  .label {
    @apply text-sm font-medium text-gray-700;
  }

  .error-text {
    @apply text-sm text-error-600;
  }

  .success-text {
    @apply text-sm text-success-600;
  }

  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
  }

  .badge-primary {
    @apply badge bg-primary-100 text-primary-800;
  }

  .badge-secondary {
    @apply badge bg-secondary-100 text-secondary-800;
  }

  .badge-success {
    @apply badge bg-success-100 text-success-800;
  }

  .badge-warning {
    @apply badge bg-warning-100 text-warning-800;
  }

  .badge-error {
    @apply badge bg-error-100 text-error-800;
  }

  .table {
    @apply w-full border-collapse;
  }

  .table th {
    @apply border-b border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700;
  }

  .table td {
    @apply border-b border-gray-100 px-4 py-3 text-sm text-gray-900;
  }

  .sidebar-link {
    @apply flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900;
  }

  .sidebar-link.active {
    @apply bg-primary-100 text-primary-900;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
EOF

# Create utility functions
echo "🔧 Creating utility functions..."
cat > src/utils/cn.ts << 'EOF'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

cat > src/utils/constants.ts << 'EOF'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000')
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'JobKeep'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  VEHICLES: '/vehicles',
  EMPLOYEES: '/employees',
  JOBCARDS: '/jobcards',
  APPOINTMENTS: '/appointments',
  INVOICES: '/invoices',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const

export const JOB_CARD_STATUSES = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  FROZEN: 'FROZEN',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED',
} as const

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOBILE_MONEY: 'MOBILE_MONEY',
  CHEQUE: 'CHEQUE',
} as const

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
EOF

# Update package.json scripts
echo "📦 Updating package.json scripts..."
# Create a temporary script to update package.json
cat > update_package.js << 'EOF'
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "build:prod": "vite build --mode production",
  "build:staging": "vite build --mode staging",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "clean": "rm -rf dist"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
EOF

node update_package.js
rm update_package.js

echo "✅ Configuration completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "• Tailwind CSS configured with JobKeep color scheme"
echo "• TypeScript paths and aliases set up"
echo "• Vite configured with API proxy"
echo "• Global styles created"
echo "• Utility functions added"
echo "• Environment files created"
echo ""
echo "🎯 Next step: Run ./03-generate-components.sh to create the UI components"