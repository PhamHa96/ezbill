import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--accent-primary)",
        "primary-hover": "var(--accent-secondary)",
        secondary: "var(--text-secondary)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },

        surface: {
          page: "var(--surface-page)",
          card: "var(--surface-card)",
          elevated: "var(--surface-elevated)",
        },

        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          soft: "var(--accent-soft)",
        },

        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          info: "var(--status-info)",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
};

export default config;
