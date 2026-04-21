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
        'royal-blue': '#1E3A8A',
        'medium-blue': '#3B82F6',
        'light-blue': '#DBEAFE',
        'sky-blue': '#EFF6FF',
      },
    },
  },
  plugins: [],
};
