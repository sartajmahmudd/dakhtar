import type { Config } from "tailwindcss";

import baseConfig from "@dakthar/tailwind-config";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#1877F2",
      },
      fontFamily: {
        sherif: ["var(--font-inter)"],
      },
    },
  },

  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
  presets: [baseConfig],
} satisfies Config;
