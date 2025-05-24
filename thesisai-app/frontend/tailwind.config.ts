import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#141414',
        'card-foreground': '#ffffff',
        primary: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#8b5cf6',
          dark: '#5b21b6',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1e1e1e',
          hover: '#2a2a2a',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#6b7280',
          foreground: '#9ca3af',
        },
        border: '#2a2a2a',
        input: '#1e1e1e',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.5)',
        'glow-sm': '0 0 10px rgba(124, 58, 237, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
export default config