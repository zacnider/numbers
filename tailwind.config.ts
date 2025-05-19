// tailwind.config.ts
// Tailwind CSS yapılandırma dosyası - Daha kapsamlı yapılandırma

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
        },
        secondary: {
          DEFAULT: '#64748b',
          hover: '#475569',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
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
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef3c7',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  // Tailwind CSS'in safelist özelliğini kullanarak sınıfları zorla dahil et
  safelist: [
    // Genel kullanılan sınıflar
    'flex', 'flex-col', 'items-center', 'justify-center', 'text-center',
    'mx-auto', 'my-4', 'mb-4', 'mt-2', 'p-4', 'px-4', 'py-2',
    'rounded-md', 'bg-white', 'bg-indigo-600', 'text-white', 'font-medium',
    'text-lg', 'shadow-md', 'gap-4', 'max-w-4xl', 'w-full', 'truncate',
    'bg-indigo-50', 'text-indigo-600', 'text-gray-500', 'font-bold', 'text-3xl',
    'grid', 'grid-cols-1', 'space-y-4', 'rounded-lg', 'bg-gray-50',
    'text-sm', 'text-xs', 'text-gray-600',
    
    // Oyun tahtası sınıfları
    'game-board', 'game-tile', 'empty', 'slidable', 'sliding',
    
    // Modal sınıfları
    'modal', 'modal-content',
    
    // İşlem durumu sınıfları
    'transaction-status', 'pending', 'confirmed', 'failed',
    
    // Cüzdan sınıfları
    'wallet-item', 'active',
    
    // Zaman uyarı sınıfı
    'time-warning',
    
    // Responsive sınıflar
    'md:grid-cols-3', 'md:col-span-1', 'md:col-span-2',
  ],
};

export default config;
