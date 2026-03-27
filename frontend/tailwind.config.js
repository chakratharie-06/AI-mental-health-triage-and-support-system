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
                    50: 'var(--primary-50)',
                    100: 'var(--primary-100)',
                    200: 'var(--primary-200)',
                    300: 'var(--primary-300)',
                    400: 'var(--primary-400)',
                    500: 'var(--primary-500)',
                    600: 'var(--primary-600)',
                    700: 'var(--primary-700)',
                    800: 'var(--primary-800)',
                    900: 'var(--primary-900)',
                },
                secondary: {
                    50: 'var(--secondary-50)',
                    100: 'var(--secondary-100)',
                    200: 'var(--secondary-200)',
                    300: 'var(--secondary-300)',
                    400: 'var(--secondary-400)',
                    500: 'var(--secondary-500)',
                    600: 'var(--secondary-600)',
                    700: 'var(--secondary-700)',
                    800: 'var(--secondary-800)',
                    900: 'var(--secondary-900)',
                },
                accent: {
                    warm: 'var(--accent-warm)',
                    gentle: 'var(--accent-gentle)',
                    care: 'var(--accent-care)',
                    focus: 'var(--accent-focus)',
                },
                success: {
                    light: 'var(--success-light)',
                    base: 'var(--success-base)',
                    dark: 'var(--success-dark)',
                },
                warning: {
                    light: 'var(--warning-light)',
                    base: 'var(--warning-base)',
                    dark: 'var(--warning-dark)',
                },
                danger: {
                    light: 'var(--danger-light)',
                    base: 'var(--danger-base)',
                    dark: 'var(--danger-dark)',
                },
                info: {
                    light: 'var(--info-light)',
                    base: 'var(--info-base)',
                    dark: 'var(--info-dark)',
                },
                surface: {
                    primary: 'var(--surface-primary)',
                    secondary: 'var(--surface-secondary)',
                    tertiary: 'var(--surface-tertiary)',
                }
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
