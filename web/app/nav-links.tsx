'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { getUiText } from '@/lib/ui-text';

interface Ranking {
  type: string;
  date: string;
}

const activeStyle = {
  color: 'var(--accent)',
  textDecoration: 'underline',
  textUnderlineOffset: '4px',
} as const;

const inactiveStyle = {
  color: 'var(--text-muted)',
} as const;

export default function NavLinks({
  latestWeekly,
  latestMonthly,
}: {
  latestWeekly?: Ranking;
  latestMonthly?: Ranking;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const lang = searchParams.get('lang') || 'zh';
  const t = getUiText(lang);
  const qs = lang === 'en' ? '?lang=en' : '';

  const isArchives = pathname === '/archives';
  const isWeekly = latestWeekly && pathname === `/digest/${latestWeekly.date}`;
  const isMonthly = latestMonthly && pathname === `/digest/${latestMonthly.date}`;

  return (
    <>
      <a
        href={`/archives${qs}`}
        className="text-sm transition-colors"
        style={isArchives ? activeStyle : inactiveStyle}
      >
        {t.archives}
      </a>
      {latestWeekly && (
        <a
          href={`/digest/${latestWeekly.date}${qs}`}
          className="text-sm transition-colors"
          style={isWeekly ? activeStyle : inactiveStyle}
        >
          {t.weekly}
        </a>
      )}
      {latestMonthly && (
        <a
          href={`/digest/${latestMonthly.date}${qs}`}
          className="text-sm transition-colors"
          style={isMonthly ? activeStyle : inactiveStyle}
        >
          {t.monthly}
        </a>
      )}
      <a
        href="https://github.com/zhalice2011/ai-daily"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm transition-colors"
        style={inactiveStyle}
      >
        GitHub
      </a>
    </>
  );
}
