/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // VS Code Dark+ palette
        border:      '#3c3c3c',
        input:       '#3c3c3c',
        ring:        'rgb(0 122 204 / <alpha-value>)',
        background:  '#1e1e1e',
        foreground:  '#d4d4d4',
        primary: {
          DEFAULT:    'rgb(0 122 204 / <alpha-value>)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT:    'rgb(45 45 45 / <alpha-value>)',
          foreground: '#d4d4d4',
        },
        destructive: {
          DEFAULT:    'rgb(244 71 71 / <alpha-value>)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT:    'rgb(45 45 45 / <alpha-value>)',
          foreground: '#808080',
        },
        accent: {
          DEFAULT:    'rgb(42 45 46 / <alpha-value>)',
          foreground: '#d4d4d4',
        },
        card: {
          DEFAULT:    '#252526',
          foreground: '#d4d4d4',
        },
      },
      borderRadius: {
        lg:    '6px',
        md:    '4px',
        sm:    '3px',
        xl:    '8px',
        '2xl': '10px',
      },
      fontFamily: {
        sans: ['-apple-system', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', '"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
