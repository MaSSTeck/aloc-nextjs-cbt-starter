import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8ee",
          100: "#f7eccf",
          500: "#d4a338",
          600: "#b88628",
          900: "#3d2b07",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
