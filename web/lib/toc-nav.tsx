'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { TocItem } from './toc';

export default function TocNav({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('');
  const isClickScrolling = useRef(false);

  const updateActiveHeading = useCallback(() => {
    if (isClickScrolling.current) return;

    const headingIds = items.filter((i) => i.level === 2).map((i) => i.id);
    const OFFSET = 100; // pixels from top to consider "active"

    let currentId = '';
    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      if (top <= OFFSET) {
        currentId = id;
      } else {
        break;
      }
    }

    // If nothing passed the offset yet, pick the first one
    if (!currentId && headingIds.length > 0) {
      currentId = headingIds[0];
    }

    setActiveId(currentId);
  }, [items]);

  useEffect(() => {
    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [updateActiveHeading]);

  if (items.length === 0) return null;

  // only show h2 in TOC for cleaner navigation
  const h2Items = items.filter((item) => item.level === 2);

  return (
    <nav className="toc-nav">
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        目录
      </p>
      <ul className="space-y-1">
        {h2Items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="toc-link block truncate rounded px-2 py-1 text-xs transition-colors"
              style={{
                color: activeId === item.id ? 'var(--accent)' : 'var(--text-muted)',
                backgroundColor: activeId === item.id ? 'var(--accent-dim)' : 'transparent',
              }}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(item.id);
                if (!target) return;
                isClickScrolling.current = true;
                setActiveId(item.id);
                target.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  isClickScrolling.current = false;
                }, 800);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
