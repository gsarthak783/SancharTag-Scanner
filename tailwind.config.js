/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#000000", // Strictly Black
                    "primary-content": "#FFFFFF",
                    "secondary": "#F3F4F6", // Gray-100
                    "secondary-content": "#1F2937", // Gray-800
                    "accent": "#000000",
                    "accent-content": "#FFFFFF",
                    "neutral": "#000000",
                    "neutral-content": "#FFFFFF",
                    "base-100": "#FFFFFF", // Pure White
                    "base-200": "#F9FAFB", // Gray-50
                    "base-300": "#E5E7EB", // Gray-200
                    "base-content": "#000000", // Black text
                    "info": "#0091FF",
                    "success": "#00C853",
                    "warning": "#FFAB00",
                    "error": "#DC2626",

                    "--rounded-box": "0.5rem",
                    "--rounded-btn": "0.5rem",
                    "--btn-text-case": "none", // No uppercase buttons
                    "--animation-btn": "0.2s",
                },
            },
        ],
    },
}
