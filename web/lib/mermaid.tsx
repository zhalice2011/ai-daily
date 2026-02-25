'use client';

import { useEffect, useRef, useState } from 'react';

function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    import('mermaid').then(({ default: mermaid }) => {
      if (cancelled) return;

      const theme = getCurrentTheme();
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'neutral',
        securityLevel: 'loose',
      });

      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (!cancelled && ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return (
      <pre
        className="overflow-x-auto rounded p-4 text-sm"
        style={{
          backgroundColor: 'var(--surface-card)',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
        }}
      >
        <code>{chart}</code>
      </pre>
    );
  }

  return <div ref={ref} className="my-4 flex justify-center overflow-x-auto" />;
}
