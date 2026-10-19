'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const syncTheme = () => {
      try {
        const stored = localStorage.getItem('bnp-theme');
        const sys = window.matchMedia?.('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        const resolved =
          stored === 'light' || stored === 'dark' ? stored : sys;
        document.documentElement.setAttribute('data-theme', resolved);
        const meta = document.querySelector(
          'meta[name="color-scheme"]'
        ) as HTMLMetaElement | null;
        if (meta)
          meta.content =
            stored === 'light' || stored === 'dark' ? stored : 'light dark';
        setTheme(resolved);
      } catch {
        setTheme('light');
      }
    };
    syncTheme();
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  function toggleTheme() {
    const sys = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const current =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light';
    const target = current === 'dark' ? 'light' : 'dark';
    try {
      if (target === sys) localStorage.removeItem('bnp-theme');
      else localStorage.setItem('bnp-theme', target);
    } catch {}
    const meta = document.querySelector(
      'meta[name="color-scheme"]'
    ) as HTMLMetaElement | null;
    if (meta) meta.content = target === sys ? 'light dark' : target;
    document.documentElement.setAttribute('data-theme', target);
    setTheme(target);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </Button>
  );
}
