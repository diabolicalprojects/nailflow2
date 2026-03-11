/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#E6A4B4", // Soft Rose
                "brand-primary": "#E6A4B4",
                "brand-secondary": "#FBCFE8",
                "brand-accent": "#F3D7CA",
                "bg-light": "#FAF3F0",
                "bg-dark": "#1A1614",
                "accent": "#F3D7CA",
            },
            fontFamily: {
                display: ["var(--font-display)", "Playfair Display", "serif"],
                sans: ["var(--font-sans)", "Inter", "sans-serif"],
            },
            borderRadius: {
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'soft': '0 4px 12px rgba(230, 164, 180, 0.08)',
                'soft-md': '0 12px 32px rgba(230, 164, 180, 0.15)',
                'soft-lg': '0 24px 64px rgba(230, 164, 180, 0.2)',
            }
        },
    },
    plugins: [],
};
