import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F1',
        butter: '#FAEAB1',
        teal: {
          DEFAULT: '#34656D',
          dark: '#2a5159',
          light: '#4a7d87',
        },
        charcoal: {
          DEFAULT: '#334443',
          dark: '#2a3736',
          light: '#4a5a58',
        },
        primary: {
          50: '#f0f9fa',
          100: '#d9f0f2',
          200: '#b3e1e5',
          300: '#8dd2d8',
          400: '#67c3cb',
          500: '#34656D',
          600: '#2a5159',
          700: '#1f3d43',
          800: '#15282c',
          900: '#0a1416',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
