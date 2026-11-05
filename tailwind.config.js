/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./terms-and-conditions.html",
    "./privacy-policy.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        winter: {
          900: "#060913",
          800: "#0D1322",
          700: "#151D33",
          600: "#1E294B",
          accent: "#00F0FF",
          teal: "#14B8A6",
          purple: "#8B5CF6",
          gold: "#F59E0B"
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "spin-slow": "spin 12s linear infinite",
        "bounce-short": "bounceShort 0.4s ease-in-out",
        "float": "float 4s infinite ease-in-out",
        "shine": "shine 2.5s infinite linear",
        "slide-in": "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "zoom-in": "zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.4))" },
          "50%": { opacity: "0.9", filter: "drop-shadow(0 0 18px rgba(0,240,255,0.8))" }
        },
        bounceShort: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" }
        },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};
