/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors ScriviAmo
        primary: {
          DEFAULT: '#134e6f',
          dark: '#0d3a52',
          light: '#1a6a96',
        },
        accent: {
          DEFAULT: '#f27622',
          light: '#ffa822',
          dark: '#d96a1f',
        },
        brand: {
          blue: '#134e6f',
          orange: '#f27622',
          yellow: '#ffa822',
          black: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 24px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 12px rgba(242, 118, 34, 0.3)',
      }
    },
  },
  plugins: [],
}
