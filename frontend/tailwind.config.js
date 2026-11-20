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
        bg: {
          primary: '#090B10',
          secondary: '#10141D',
          elevated: '#151B27',
          surface: '#1E2536',
          hover: '#252F43',
        },
        border: {
          subtle: '#1C2333',
          DEFAULT: '#252D3B',
          light: '#374151',
          accent: '#8B7CFF',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        accent: {
          primary: '#8B7CFF',
          secondary: '#38BDF8',
          hover: '#7967FA',
        },
        status: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        math: ['"KaTeX_Math"', 'KaTeX_Main', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'glow-accent': '0 0 24px -4px rgba(139, 124, 255, 0.35)',
        'glow-cyan': '0 0 24px -4px rgba(56, 189, 248, 0.35)',
        'glow-emerald': '0 0 24px -4px rgba(52, 211, 153, 0.35)',
        'glow-hero': '0 0 80px 10px rgba(139, 124, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(circle at 50% 0%, rgba(139, 124, 255, 0.18) 0%, rgba(56, 189, 248, 0.08) 35%, transparent 70%)',
        'card-glow': 'linear-gradient(135deg, rgba(139, 124, 255, 0.12) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 100%)',
        'border-glow': 'linear-gradient(135deg, rgba(139, 124, 255, 0.5), rgba(56, 189, 248, 0.3), rgba(37, 45, 59, 0.5))',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
      },
    },
  },
  plugins: [],
}
