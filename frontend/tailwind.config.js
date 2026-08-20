/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        nirvaan: {
          primary: "#1F4E79",
          accent: "#D64541",
        },
      },
    },
  },
  plugins: [],
};