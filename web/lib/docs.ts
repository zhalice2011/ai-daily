import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DOCS_DIR = join(process.cwd(), 'docs');
const DATE_RE = /^(\d{4}_\d{2}_\d{2})\.md$/;

export interface DigestEntry {
  date: string;      // YYYY_MM_DD
  displayDate: string; // YYYY-MM-DD
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

export async function getDigestContent(date: string): Promise<string | null> {
  try {
    return await readFile(join(DOCS_DIR, `${date}.md`), 'utf-8');
  } catch {
    return null;
  }
}
