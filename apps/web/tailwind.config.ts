import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#F0F5FA',
            100: '#E2ECF6',
            200: '#C5D8ED',
            300: '#99BCE0',
            400: '#649AD0',
            500: '#3D7CBD',
            600: '#2762A4',
            700: '#184878', // Secondary Brand Navy
            800: '#0F2C59', // Primary Brand Core Navy
            900: '#0A1E3D',
            950: '#061327',
          },
          emerald: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            200: '#BBF7D0',
            300: '#86EFAC',
            400: '#4ADE80',
            500: '#48A830', // Brand Accent Light Emerald
            600: '#2E7D32', // Brand Accent Core Emerald
            700: '#1E6325',
            800: '#164E1C',
            900: '#144119',
          },
          gold: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(15, 44, 89, 0.05), 0 1px 2px rgba(15, 44, 89, 0.03)',
        'soft-md': '0 4px 12px rgba(15, 44, 89, 0.08), 0 2px 4px rgba(15, 44, 89, 0.04)',
        'soft-lg': '0 10px 25px -3px rgba(15, 44, 89, 0.1), 0 4px 6px -2px rgba(15, 44, 89, 0.05)',
        'soft-xl': '0 20px 35px -5px rgba(15, 44, 89, 0.12), 0 10px 10px -5px rgba(15, 44, 89, 0.04)',
        'glow-emerald': '0 0 20px -3px rgba(46, 125, 50, 0.35)',
        'glow-navy': '0 0 25px -3px rgba(15, 44, 89, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
