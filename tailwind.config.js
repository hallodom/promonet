/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0F',
        'surface-1': '#14141A',
        'surface-2': '#1F1F28',
        voltage: '#2540E8',
        emergence: '#FF4A1C',
        bone: '#F5F5F2',
        graphite: '#6B7280',
        chrysalis: '#2D1B4E',
        imago: '#4A7C59',
      },
      fontFamily: {
        slab: ['"Roboto Slab"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.02em',
        display: '-0.015em',
      },
    },
  },
  plugins: [],
}
