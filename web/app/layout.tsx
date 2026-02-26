import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Newspaper } from 'lucide-react';
import { listRankings } from '@/lib/docs';
import ThemeToggle from './theme-toggle';
import LangToggle from './lang-toggle';
import NavLinks from './nav-links';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Daily Digest',
  description: 'AI-curated daily digest from top Hacker News blogs',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rankings = await listRankings();
  const latestWeekly = rankings.find((r) => r.type === 'weekly');
  const latestMonthly = rankings.find((r) => r.type === 'monthly');

  return (
    <html lang="zh" className="dark" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before paint — avoids FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.className=t}else if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.className='light'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <header
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'color-mix(in srgb, var(--bg) 80%, transparent)',
          }}
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
            <a href="/" className="flex items-center gap-2 font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              <Newspaper size={20} style={{ color: 'var(--accent)' }} />
              <span>AI Daily Digest</span>
            </a>
            <div className="flex items-center gap-3">
              <Suspense>
                <NavLinks
                  latestWeekly={latestWeekly}
                  latestMonthly={latestMonthly}
                />
              </Suspense>
              <ThemeToggle />
              <Suspense>
                <LangToggle />
              </Suspense>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          AI Daily Digest — AI-curated tech articles from Hacker News blogs
        </footer>
      </body>
    </html>
  );
}
