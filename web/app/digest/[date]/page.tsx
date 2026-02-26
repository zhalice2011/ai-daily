import { notFound } from 'next/navigation';
import { getDigestContent, listDigests, listRankings } from '@/lib/docs';
import { getUiText } from '@/lib/ui-text';
import { ArrowLeft } from 'lucide-react';
import DigestContent from '@/lib/digest-content';

interface PageProps {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function DigestPage({ params, searchParams }: PageProps) {
  const { date } = await params;
  const { lang } = await searchParams;
  const t = getUiText(lang);
  const content = await getDigestContent(date, lang);

  if (!content) {
    notFound();
  }

  const isRanking = date.startsWith('weekly_') || date.startsWith('monthly_');
  const displayDate = date.replace(/^(weekly|monthly)_/, '').replace(/_/g, '-');
  const backHref = lang === 'en'
    ? (isRanking ? '/rankings?lang=en' : '/archives?lang=en')
    : (isRanking ? '/rankings' : '/archives');
  const backLabel = isRanking ? t.rankings : t.archives;
  const pageLabel = isRanking
    ? (date.startsWith('weekly_') ? t.weekly : t.monthly)
    : t.digest;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <a
          href={backHref}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} />
          {backLabel}
        </a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          {displayDate} {pageLabel}
        </h1>
      </div>
      <DigestContent content={content} />
    </div>
  );
}

export async function generateStaticParams() {
  const [digests, rankings] = await Promise.all([listDigests(), listRankings()]);
  return [
    ...digests.map((d) => ({ date: d.date })),
    ...rankings.map((r) => ({ date: r.date })),
  ];
}
