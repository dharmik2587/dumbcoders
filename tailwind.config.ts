import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#162033',
          950: '#0a0d14',
          900: '#101522',
          850: '#151b2a',
          800: '#1b2333',
        },
        paper: {
          DEFAULT: '#ffffff',
          2: '#f5f7fa',
          3: '#eef2f7',
        },
        beam: '#4f8cff',
        'slate-muted': '#64748b',
        'slate-tech': '#94a3b8',
        'dark-ink': '#111827',
        canvas: 'var(--bg-0)',
        surface: 'var(--bg-1)',
        raised: 'var(--bg-2)',
        hover: 'var(--bg-3)',
        inverse: 'var(--bg-inverse)',
        line: 'var(--hairline)',
        'line-strong': 'var(--hairline-strong)',
        fg: 'var(--fg)',
        fg2: 'var(--fg-2)',
        fg3: 'var(--fg-3)',
        accent: {
          DEFAULT: 'var(--accent)',
          ink: 'var(--accent-ink)',
          soft: 'var(--accent-soft)',
          line: 'var(--accent-line)',
        },
        mint: {
          DEFAULT: 'var(--mint)',
          soft: 'var(--mint-soft)',
          line: 'var(--mint-line)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
          line: 'var(--amber-line)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
        },
        violet: 'var(--violet)',
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          500: '#3182ce',
          600: '#2563a6',
          700: '#1d4f84',
        },
      },
      fontFamily: {
        display: [
          'Geist',
          'Plus Jakarta Sans',
          'Manrope',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'IBM Plex Mono',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      animation: {
        marquee: 'marquee 42s linear infinite',
        'marquee-slow': 'marquee 90s linear infinite',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite',
        sweep: 'sweep 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        rise: 'rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '12%': { opacity: '1' },
          '88%': { opacity: '1' },
          '100%': { transform: 'translateY(900%)', opacity: '0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translate3d(0, 18px, 0)', filter: 'blur(6px)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)', filter: 'blur(0)' },
        },
      },
      boxShadow: {
        soft: '0 18px 50px rgba(30, 41, 59, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
