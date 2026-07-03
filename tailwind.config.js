/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)', 'Anton', 'Impact', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      colors: {
        // FailureSays brand palette
        paper: '#F7F4EE',
        cream: '#F7F5EF',
        card: '#FFFFFF',
        ink: '#000000',
        muted: '#5E5E5E',
        subtle: '#8A8A8A',
        rule: '#DDD9CF',
        // shadcn compat (mapped to brand)
        border: '#DDD9CF',
        input: '#DDD9CF',
        ring: '#000000',
        background: '#F1EFE7',
        foreground: '#000000',
        primary: { DEFAULT: '#000000', foreground: '#F1EFE7' },
        secondary: { DEFAULT: '#F7F5EF', foreground: '#000000' },
        destructive: { DEFAULT: '#8A1A1A', foreground: '#F1EFE7' },
        accent: { DEFAULT: '#F7F5EF', foreground: '#000000' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#000000' },
      },
      borderRadius: {
        lg: '2px',
        md: '2px',
        sm: '2px',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'slide-up': { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'slow-spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'float': { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-14px)' } },
        'marquee': { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out both',
        'slide-up': 'slide-up 0.7s ease-out both',
        'slow-spin': 'slow-spin 60s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'marquee': 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
