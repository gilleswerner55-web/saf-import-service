import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SAF Brand colors (from logo - red/black)
        primary: {
          DEFAULT: '#C41E3A', // SAF Red
          light: '#E02050',
          dark: '#9A1830',
          50: '#FEF2F4',
          100: '#FDE6E9',
          200: '#FBCCD3',
          300: '#F8A3B0',
          400: '#F26B81',
          500: '#C41E3A',
          600: '#A31830',
          700: '#831426',
          800: '#63101D',
          900: '#420B14',
        },
        // Dark background tones
        dark: {
          DEFAULT: '#1A1A1A',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#999999',
          400: '#666666',
          500: '#4D4D4D',
          600: '#333333',
          700: '#262626',
          800: '#1A1A1A',
          900: '#0D0D0D',
        },
        // Swiss white
        white: '#FFFFFF',
        // Accent gold for rankings/medals
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#B8860B',
        },
        silver: '#C0C0C0',
        bronze: '#CD7F32',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
