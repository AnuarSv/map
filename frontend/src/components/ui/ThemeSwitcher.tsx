import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check saved theme or system preference
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggle = () => {
        if (isDark) {
            // Switch to LIGHT
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            // Switch to DARK  
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggle}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: isDark ? '2px solid #334155' : '2px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
        >
            {isDark ? (
                <Moon size={24} color="#60a5fa" />
            ) : (
                <Sun size={24} color="#f59e0b" />
            )}
        </button>
    );
}
