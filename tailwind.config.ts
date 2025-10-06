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
        cream: '#F2F2F2',
        beige: '#EAE4D5',
        taupe: {
          DEFAULT: '#B6B09F',
          dark: '#9a9585',
          light: '#c9c4b5',
        },
        charcoal: {
          DEFAULT: '#000000',
          dark: '#000000',
          light: '#1a1a1a',
        },
        primary: {
          50: '#f5f5f5',
          100: '#ebebeb',
          200: '#d6d6d6',
          300: '#c2c2c2',
          400: '#adadad',
          500: '#B6B09F',
          600: '#9a9585',
          700: '#7d7a6b',
          800: '#5e5c52',
          900: '#3f3e38',
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
