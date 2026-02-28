/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shapeshft palette
        violet:  '#8B5CF6',
        cyan:    '#22D3EE',
        pink:    '#F472B6',
        emerald: '#34D399',
        // Semantic aliases — use rgb channel format so Tailwind opacity modifiers work
        // e.g. bg-primary/5, bg-muted/50, bg-destructive/10
        border:      'rgba(255,255,255,0.09)',
        input:       'rgba(255,255,255,0.09)',
        ring:        'rgb(139 92 246 / <alpha-value>)',
        background:  '#06061a',
        foreground:  '#F1F0FF',
        primary: {
          DEFAULT:    'rgb(139 92 246 / <alpha-value>)',
          foreground: '#F1F0FF',
        },
        secondary: {
          DEFAULT:    'rgb(255 255 255 / <alpha-value>)',
          foreground: '#F1F0FF',
        },
        destructive: {
          DEFAULT:    'rgb(244 63 94 / <alpha-value>)',
          foreground: '#F1F0FF',
        },
        muted: {
          DEFAULT:    'rgb(255 255 255 / <alpha-value>)',
          foreground: 'rgba(241,240,255,0.45)',
        },
        accent: {
          DEFAULT:    'rgb(255 255 255 / <alpha-value>)',
          foreground: '#F1F0FF',
        },
        card: {
          DEFAULT:    '#06061a',
          foreground: '#F1F0FF',
        },
      },
      borderRadius: {
        lg:  '20px',
        md:  '14px',
        sm:  '12px',
        xl:  '24px',
        '2xl': '28px',
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
}
