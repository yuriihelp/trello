module.exports = {
    darkMode: 'class', // Enable dark mode
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                // Light theme
                'bg-primary': '#F8FAFC',
                'bg-secondary': '#FFFFFF',
                'text-primary': '#1E293B',
                'text-secondary': '#64748B',

                // Dark theme (auto with dark: prefix)
                dark: {
                    'bg-primary': '#0F172A',
                    'bg-secondary': '#1E293B',
                    'text-primary': '#F1F5F9',
                    'text-secondary': '#94A3B8',
                }
            }
        }
    }
}