/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#F7F7F7',
        surface: '#FFFFFF',
        dark: {
          DEFAULT: '#111921',
          card:    '#32373B',
          border:  'rgba(255,255,255,0.08)',
        },
        mint: {
          light:  '#C9F8DE',
          DEFAULT:'#78EDB2',
          dark:   '#4ECDA0',
        },
        teal: {
          deep:   '#0a3547',
          mid:    '#1b8fc0',
        },
        ink: {
          DEFAULT:  '#09090B',
          secondary:'#52525B',
          muted:    '#71717A',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        body:    ['Kodchasan', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['clamp(2.6rem,5.5vw,4.5rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h2:   ['clamp(1.875rem,4vw,2.75rem)', { lineHeight: '1.2',  letterSpacing: '-0.022em' }],
        h3:   ['1.25rem',   { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        body: ['1rem',      { lineHeight: '1.75' }],
        sm:   ['0.9375rem', { lineHeight: '1.65' }],
        xs:   ['0.8125rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        pill:  '120px',
        card:  '20px',
        tag:   '999px',
        input: '12px',
      },
      boxShadow: {
        card:       '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.08)',
        mint:       '0 6px 24px rgba(120,237,178,0.30)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      maxWidth: {
        content: '1100px',
      },
    },
  },
  plugins: [],
}
