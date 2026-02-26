import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = join(process.cwd(), 'docs');
const DATE_RE = /^(\d{4}_\d{2}_\d{2})\.md$/;
const WEEKLY_RE = /^weekly_(\d{4}_\d{2}_\d{2})\.md$/;
const MONTHLY_RE = /^monthly_(\d{4}_\d{2}_\d{2})\.md$/;

export interface DigestEntry {
  date: string;      // YYYY_MM_DD
  displayDate: string; // YYYY-MM-DD
}

export type RankingType = 'weekly' | 'monthly';

export interface RankingEntry {
  date: string;        // weekly_YYYY_MM_DD or monthly_YYYY_MM_DD
  displayDate: string; // YYYY-MM-DD
  type: RankingType;
}

export async function listDigests(): Promise<DigestEntry[]> {
  let files: string[];
  try {
    files = await readdir(DOCS_DIR);
  } catch {
    return [];
  }

  return files
    .filter((f) => DATE_RE.test(f))
    .map((f) => {
      const date = f.replace('.md', '');
      return { date, displayDate: date.replace(/_/g, '-') };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function listRankings(): Promise<RankingEntry[]> {
  let files: string[];
  try {
    files = await readdir(DOCS_DIR);
  } catch {
    return [];
  }

  const entries: RankingEntry[] = [];

  for (const f of files) {
    let match: RegExpMatchArray | null;

    if ((match = WEEKLY_RE.exec(f))) {
      entries.push({
        date: `weekly_${match[1]}`,
        displayDate: match[1]!.replace(/_/g, '-'),
        type: 'weekly',
      });
    } else if ((match = MONTHLY_RE.exec(f))) {
      entries.push({
        date: `monthly_${match[1]}`,
        displayDate: match[1]!.replace(/_/g, '-'),
        type: 'monthly',
      });
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDigestContent(date: string, lang?: string): Promise<string | null> {
  if (lang === 'en') {
    try {
      return await readFile(join(DOCS_DIR, `${date}_en.md`), 'utf-8');
    } catch {
      // fallback to Chinese version
    }
  }
  try {
    return await readFile(join(DOCS_DIR, `${date}.md`), 'utf-8');
  } catch {
    return null;
  }
}
