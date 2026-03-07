/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6C63FF',
          secondary: '#FF6584',
          accent: '#43E97B',
        },
        bg: {
          base: '#F8F7FF',
          card: '#FFFFFF',
          surface: '#F0EFFB',
        },
        border: '#E8E7F5',
        'text-pri': '#1A1A2E',
        'text-sec': '#6B6B8A',
        'text-mut': '#B0B0C8',
        category: {
          lifestyle: '#43E97B',
          kids:      '#FFA94D',
          romance:   '#FF6584',
          smarter:   '#4DABF7',
          social:    '#DA77F2',
          fun:       '#FFD43B',
        },
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        card:  '0 2px 8px rgba(108,99,255,0.08)',
        'card-hover': '0 4px 16px rgba(108,99,255,0.16)',
        fab:   '0 4px 20px rgba(108,99,255,0.40)',
        modal: '0 8px 40px rgba(0,0,0,0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
