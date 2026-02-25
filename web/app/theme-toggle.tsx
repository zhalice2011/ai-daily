'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function applyTheme(theme: 'dark' | 'light') {
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    localStorage.setItem('theme', next);
  };

  if (!mounted) {
    // Prevent hydration mismatch — render placeholder with same dimensions
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换亮色模式' : '切换暗色模式'}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      style={{
        color: 'var(--text-muted)',
        backgroundColor: 'transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.backgroundColor = 'var(--surface-card)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
