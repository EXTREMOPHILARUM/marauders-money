/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#4f46e5',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '#0f172a',
      },
    },
  },
  plugins: [],
};
