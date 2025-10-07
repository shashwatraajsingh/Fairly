import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
      colors: {
        cream: '#F2F2F2',
        beige: '#EAE4D5',
        teal: {
          DEFAULT: '#5BC5A7',
          dark: '#48A88E',
          light: '#6DD4B8',
          50: '#F0FAF7',
          100: '#D4F1E9',
          200: '#A9E3D3',
          300: '#7DD5BD',
          400: '#5BC5A7',
          500: '#48A88E',
          600: '#3A8A75',
          700: '#2C6B5C',
          800: '#1E4D43',
          900: '#0F2E2A',
        },
        charcoal: {
          DEFAULT: '#000000',
          dark: '#000000',
          light: '#1a1a1a',
        },
        primary: {
          50: '#F0FAF7',
          100: '#D4F1E9',
          200: '#A9E3D3',
          300: '#7DD5BD',
          400: '#5BC5A7',
          500: '#48A88E',
          600: '#3A8A75',
          700: '#2C6B5C',
          800: '#1E4D43',
          900: '#0F2E2A',
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
