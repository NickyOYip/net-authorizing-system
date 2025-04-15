/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        broadcast: '#3b82f6', // blue-500
        public: '#10b981', // green-500
        private: '#8b5cf6', // purple-500
        active: '#10b981', // green-500
        pending: '#f59e0b', // amber-500
        disabled: '#6b7280', // gray-500
        expired: '#ef4444', // red-500
      }
    },
  },
  plugins: [],
}