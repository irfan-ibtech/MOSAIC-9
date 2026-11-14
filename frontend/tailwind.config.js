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
        space: {
          950: '#040711',
          900: '#070b16',
          850: '#0d1322',
          800: '#121b2f',
          750: '#17223b',
          700: '#1e2c4c',
          600: '#2d3f66',
          500: '#435887',
          400: '#6980b3',
          300: '#9cb0d9',
          200: '#cbd5e1',
          100: '#e2e8f0',
        },
        telemetry: {
          cyan: '#06b6d4',
          cyanGlow: 'rgba(6, 182, 212, 0.15)',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        status: {
          stable: '#10b981',
          watch: '#f59e0b',
          review: '#f43f5e',
          unknown: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.25)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
