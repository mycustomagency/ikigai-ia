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
        ikigai: {
          purple: '#7F77DD',
          teal: '#1D9E75',
          coral: '#D85A30',
          amber: '#BA7517',
        }
      }
    },
  },
  plugins: [],
}
