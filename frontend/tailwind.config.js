/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#E6F7F7',
                    100: '#B3E5E6',
                    200: '#80D4D6',
                    300: '#4DC2C6',
                    400: '#26B5BA',
                    500: '#0EA5A5',
                    600: '#0C8C8C',
                    700: '#0A7373',
                    800: '#085A5A',
                    900: '#064141',
                },
                secondary: {
                    50: '#F5F3FF',
                    100: '#E9E5FF',
                    200: '#D4CCFF',
                    300: '#B8ACFF',
                    400: '#9D8CFF',
                    500: '#8B7FFF',
                    600: '#7269DB',
                    700: '#5A53B7',
                    800: '#433D93',
                    900: '#2C276F',
                },
                accent: {
                    warm: '#FFB84D',
                    gentle: '#A8E6CF',
                    care: '#FFD6E0',
                    focus: '#C7D2FE',
                },
            },
            fontFamily: {
                heading: ['Lexend', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'base': '0.5rem',
                'md': '0.75rem',
                'lg': '1rem',
                'xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
        },
    },
    plugins: [],
}
