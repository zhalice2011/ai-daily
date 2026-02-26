import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import process from 'node:process';

// ============================================================================
// Types
// ============================================================================

interface ParsedArticle {
  titleZh: string;
  title: string;
  link: string;
  source: string;
  pubDate: string; // "MM-DD HH:MM"
  score: number;
  category: string;
  categoryEmoji: string;
  summary: string;
  keywords: string[];
  fileDate: string; // "YYYY_MM_DD" — which daily digest it came from
}

// ============================================================================
// Markdown Parser — extract articles from daily digest files
// ============================================================================

function parseDigestMarkdown(content: string, fileDate: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const lines = content.split('\n');

  // Metadata line pattern: [Title](link) — **source** · MM-DD HH:MM · ⭐ XX/30
  const metaRe = /^\[([^\]]+)\]\(([^)]+)\)\s*—\s*\*?\*?([^*·]+?)\*?\*?\s*·\s*(\d{2}-\d{2}\s+\d{2}:\d{2})\s*·\s*⭐\s*(\d+)\/30$/;
  // Section heading pattern: ### N. Title
  const headingRe = /^### \d+\.\s+(.+)$/;
  // Category section pattern: ## emoji Category
  const categoryRe = /^## (.+)$/;

  let currentCategory = { emoji: '📝', label: '其他' };
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    // Track current category section
    const catMatch = categoryRe.exec(line);
    if (catMatch) {
      const header = catMatch[1]!.trim();
      if (/AI\s*\/\s*ML/i.test(header)) currentCategory = { emoji: '🤖', label: 'AI / ML' };
      else if (/安全|Security/i.test(header)) currentCategory = { emoji: '🔒', label: '安全' };
      else if (/工程|Engineering/i.test(header)) currentCategory = { emoji: '⚙️', label: '工程' };
      else if (/工具|Tools|开源|OSS/i.test(header)) currentCategory = { emoji: '🛠', label: '工具 / 开源' };
      else if (/观点|Opinion|杂谈/i.test(header)) currentCategory = { emoji: '💡', label: '观点 / 杂谈' };
      else if (/必读|Must/i.test(header) || /看点|Highlight/i.test(header)) { i++; continue; }
      else currentCategory = { emoji: '📝', label: '其他' };
      i++;
      continue;
    }

    // Look for article heading: ### N. TitleZh
    const headMatch = headingRe.exec(line);
    if (!headMatch) { i++; continue; }

    const titleZh = headMatch[1]!.trim();
    i++;

    // Skip blank lines
    while (i < lines.length && lines[i]!.trim() === '') i++;

    // Expect metadata line
    if (i >= lines.length) break;
    const metaMatch = metaRe.exec(lines[i]!.trim());
    if (!metaMatch) { continue; }

    const title = metaMatch[1]!.trim();
    const link = metaMatch[2]!.trim();
    const source = metaMatch[3]!.trim();
    const pubDate = metaMatch[4]!.trim();
    const score = parseInt(metaMatch[5]!, 10);
    i++;

    // Skip blank lines
    while (i < lines.length && lines[i]!.trim() === '') i++;

    // Collect summary (lines starting with > or continuation lines)
    let summary = '';
    if (i < lines.length && lines[i]!.startsWith('> ')) {
      summary = lines[i]!.slice(2);
      i++;
      // Continue collecting multi-line summary
      while (i < lines.length) {
        const sl = lines[i]!;
        if (sl.startsWith('> ')) {
          summary += ' ' + sl.slice(2);
          i++;
        } else if (sl.trim() === '' || sl.startsWith('🏷️') || sl.startsWith('---') || sl.startsWith('##') || sl.startsWith('###')) {
          break;
        } else {
          // continuation line (no > prefix)
          summary += ' ' + sl;
          i++;
        }
      }
    }

    // Skip blank lines
    while (i < lines.length && lines[i]!.trim() === '') i++;

    // Collect keywords
    let keywords: string[] = [];
    if (i < lines.length && lines[i]!.startsWith('🏷️')) {
      keywords = lines[i]!.replace('🏷️', '').trim().split(/,\s*/);
      i++;
    }

    articles.push({
      titleZh,
      title,
      link,
      source,
      pubDate,
      score,
      category: currentCategory.label,
      categoryEmoji: currentCategory.emoji,
      summary: summary.trim(),
      keywords,
      fileDate,
    });
  }

  return articles;
}

// ============================================================================
// File Discovery
// ============================================================================

async function findDigestFiles(docsDir: string, days: number, lang: 'zh' | 'en'): Promise<{ path: string; date: string }[]> {
  const files = await readdir(docsDir);
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Match daily digest files: YYYY_MM_DD.md (zh) or YYYY_MM_DD_en.md (en)
  // Exclude weekly_* and monthly_* files
  const suffix = lang === 'en' ? '_en.md' : '.md';
  const dateRe = /^(\d{4})_(\d{2})_(\d{2})$/;

  const result: { path: string; date: string }[] = [];

  for (const f of files) {
    // Skip non-target language files
    if (lang === 'en' && !f.endsWith('_en.md')) continue;
    if (lang === 'zh' && (f.endsWith('_en.md') || !f.endsWith('.md'))) continue;

    // Skip ranking files
    if (f.startsWith('weekly_') || f.startsWith('monthly_')) continue;

    // Extract date part
    const datePart = lang === 'en' ? f.replace('_en.md', '') : f.replace('.md', '');
    const m = dateRe.exec(datePart);
    if (!m) continue;

    const fileDate = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
    if (fileDate >= cutoff) {
      result.push({ path: join(docsDir, f), date: datePart });
    }
  }

  return result.sort((a, b) => b.date.localeCompare(a.date));
}

// ============================================================================
// Deduplication
// ============================================================================

function deduplicateArticles(articles: ParsedArticle[]): ParsedArticle[] {
  const seen = new Map<string, ParsedArticle>();
  for (const a of articles) {
    // Deduplicate by link — keep the one with higher score, or newer date on tie
    const existing = seen.get(a.link);
    if (!existing || a.score > existing.score ||
        (a.score === existing.score && a.fileDate > existing.fileDate)) {
      seen.set(a.link, a);
    }
  }
  return Array.from(seen.values());
}

// ============================================================================
// Report Generation
// ============================================================================

interface RankingReportOptions {
  articles: ParsedArticle[];
  days: number;
  topN: number;
  lang: 'zh' | 'en';
  totalFiles: number;
  totalParsed: number;
}

function generateRankingReport(opts: RankingReportOptions): string {
  const { articles, days, topN, lang, totalFiles, totalParsed } = opts;
  const isEn = lang === 'en';
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const rangeLabel = days <= 7
    ? (isEn ? 'Weekly' : '周')
    : (isEn ? 'Monthly' : '月');
  const emoji = days <= 7 ? '🔥' : '📊';

  let report = '';

  // Header
  report += isEn
    ? `# ${emoji} AI Blog ${rangeLabel} Top ${topN} — ${dateStr}\n\n`
    : `# ${emoji} AI 博客${rangeLabel}榜 Top ${topN} — ${dateStr}\n\n`;

  report += isEn
    ? `> Top ${topN} most impactful articles from the past ${days} days, ranked by AI score\n\n`
    : `> 过去 ${days} 天最具影响力的 ${topN} 篇文章，按 AI 评分排序\n\n`;

  report += `---\n\n`;

  // Articles
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i]!;
    const rank = i + 1;
    const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `**${rank}.**`;

    report += `${medal} **${a.titleZh || a.title}** — ⭐ ${a.score}/30\n\n`;
    report += `[${a.title}](${a.link}) — **${a.source}** · ${a.pubDate} · ${a.categoryEmoji} ${a.category}\n\n`;

    if (a.summary) {
      report += `> ${a.summary}\n\n`;
    }

    if (a.keywords.length > 0) {
      report += `🏷️ ${a.keywords.join(', ')}\n\n`;
    }

    report += `---\n\n`;
  }

  // Footer
  const time = now.toISOString().split('T')[1]?.slice(0, 5) || '';
  report += isEn
    ? `*Generated at ${dateStr} ${time} | Scanned ${totalFiles} daily digests · ${totalParsed} articles parsed · Top ${articles.length} selected from past ${days} days*\n`
    : `*生成于 ${dateStr} ${time} | 扫描 ${totalFiles} 份日报 · 解析 ${totalParsed} 篇文章 · 过去 ${days} 天精选 Top ${articles.length}*\n`;

  report += isEn
    ? `*Based on [Hacker News Popularity Contest 2025](https://refactoringenglish.com/tools/hn-popularity/) RSS feed list, recommended by [Andrej Karpathy](https://x.com/karpathy)*\n`
    : `*基于 [Hacker News Popularity Contest 2025](https://refactoringenglish.com/tools/hn-popularity/) RSS 源列表，由 [Andrej Karpathy](https://x.com/karpathy) 推荐*\n`;

  return report;
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): never {
  console.log(`AI Ranking — Generate weekly/monthly top articles from existing daily digests

Usage:
  bun scripts/ranking.ts [options]

Options:
  --days <n>      Look back N days (default: 7)
  --top-n <n>     Number of top articles (default: 30)
  --lang <zh|en>  Language (default: zh)
  --docs <path>   Docs directory (default: ./web/docs)
  --output <path> Output file path (auto-generated if omitted)
  --help          Show this help

Examples:
  # Weekly top 30 (Chinese)
  bun scripts/ranking.ts --days 7 --top-n 30 --lang zh

  # Monthly top 30 (English)
  bun scripts/ranking.ts --days 30 --top-n 30 --lang en
`);
  process.exit(0);
}

function parseArgs(argv: string[]): {
  days: number;
  topN: number;
  lang: 'zh' | 'en';
  docsDir: string;
  outputPath: string;
} {
  let days = 7;
  let topN = 30;
  let lang: 'zh' | 'en' = 'zh';
  let docsDir = './web/docs';
  let outputPath = '';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--days' && argv[i + 1]) {
      days = parseInt(argv[++i]!, 10);
    } else if (arg === '--top-n' && argv[i + 1]) {
      topN = parseInt(argv[++i]!, 10);
    } else if (arg === '--lang' && argv[i + 1]) {
      lang = argv[++i] as 'zh' | 'en';
    } else if (arg === '--docs' && argv[i + 1]) {
      docsDir = argv[++i]!;
    } else if (arg === '--output' && argv[i + 1]) {
      outputPath = argv[++i]!;
    }
  }

  if (!outputPath) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '_');
    const prefix = days <= 7 ? 'weekly' : 'monthly';
    const langSuffix = lang === 'en' ? '_en' : '';
    outputPath = `${docsDir}/${prefix}_${dateStr}${langSuffix}.md`;
  }

  return { days, topN, lang, docsDir, outputPath };
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();

  const { days, topN, lang, docsDir, outputPath } = parseArgs(args);

  console.log(`[ranking] === AI Ranking ===`);
  console.log(`[ranking] Days: ${days}`);
  console.log(`[ranking] Top N: ${topN}`);
  console.log(`[ranking] Language: ${lang}`);
  console.log(`[ranking] Docs: ${docsDir}`);
  console.log(`[ranking] Output: ${outputPath}`);
  console.log('');

  // Step 1: Find digest files
  console.log(`[ranking] Step 1/3: Finding digest files from last ${days} days...`);
  const digestFiles = await findDigestFiles(docsDir, days, lang);

  if (digestFiles.length === 0) {
    console.error(`[ranking] Error: No digest files found in ${docsDir} for the last ${days} days.`);
    process.exit(1);
  }
  console.log(`[ranking] Found ${digestFiles.length} digest files`);

  // Step 2: Parse articles from all files
  console.log(`[ranking] Step 2/3: Parsing articles...`);
  let allArticles: ParsedArticle[] = [];

  for (const f of digestFiles) {
    const content = await readFile(f.path, 'utf-8');
    const parsed = parseDigestMarkdown(content, f.date);
    console.log(`[ranking]   ${f.date}: ${parsed.length} articles`);
    allArticles.push(...parsed);
  }

  console.log(`[ranking] Total parsed: ${allArticles.length} articles`);

  // Deduplicate (same article may appear in multiple daily digests)
  const deduplicated = deduplicateArticles(allArticles);
  if (deduplicated.length < allArticles.length) {
    console.log(`[ranking] After deduplication: ${deduplicated.length} unique articles`);
  }

  // Step 3: Sort and generate report
  console.log(`[ranking] Step 3/3: Generating ranking report...`);

  // Sort: score desc, then fileDate desc (newer first on tie)
  deduplicated.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.fileDate.localeCompare(a.fileDate);
  });

  const topArticles = deduplicated.slice(0, topN);

  const report = generateRankingReport({
    articles: topArticles,
    days,
    topN,
    lang,
    totalFiles: digestFiles.length,
    totalParsed: allArticles.length,
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, report);

  console.log('');
  console.log(`[ranking] Done!`);
  console.log(`[ranking] Report: ${outputPath}`);
  console.log(`[ranking] Stats: ${digestFiles.length} files -> ${allArticles.length} articles -> ${deduplicated.length} unique -> Top ${topArticles.length}`);

  if (topArticles.length > 0) {
    console.log('');
    console.log(`[ranking] Top 3 Preview:`);
    for (let i = 0; i < Math.min(3, topArticles.length); i++) {
      const a = topArticles[i]!;
      console.log(`  ${i + 1}. [${a.score}/30] ${a.titleZh || a.title}`);
    }
  }
}

await main().catch((err) => {
  console.error(`[ranking] Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
