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
          DEFAULT: '#0EA5E9', // Azul Turquesa
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        secondary: {
          DEFAULT: '#22C55E', // Verde Vibrante
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        gamification: {
          DEFAULT: '#FACC15', // Amarelo Sol
          50: '#FEFCE8',
          100: '#FEF3C7',
          500: '#FACC15',
          600: '#EAB308',
          700: '#CA8A04',
        },
        background: {
          light: '#F9FAFB', // Cinza Suave
          dark: '#0F172A', // Azul Noturno
        },
        text: {
          primary: '#1E293B', // Cinza Grafite
          secondary: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
