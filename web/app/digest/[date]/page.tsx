import { notFound } from 'next/navigation';
import { getDigestContent, listDigests } from '@/lib/docs';
import { ArrowLeft } from 'lucide-react';
import DigestContent from '@/lib/digest-content';

interface PageProps {
  params: Promise<{ date: string }>;
}

export default async function DigestPage({ params }: PageProps) {
  const { date } = await params;
  const content = await getDigestContent(date);

  if (!content) {
    notFound();
  }

  const displayDate = date.replace(/_/g, '-');

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <a
          href="/"
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} />
          返回最新
        </a>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
          {displayDate} 日报
        </h1>
      </div>
      <DigestContent content={content} />
    </div>
  );
}

export async function generateStaticParams() {
  const digests = await listDigests();
  return digests.map((d) => ({ date: d.date }));
}
