import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import process from 'node:process';

import type { Article, ArticleCache, CategoryId, ScoredArticle } from './lib/types.ts';
import { OPENAI_DEFAULT_API_BASE } from './lib/types.ts';
import { RSS_FEEDS } from './lib/feeds.ts';
import { fetchAllFeeds } from './lib/fetcher.ts';
import { createAIClient, inferOpenAIModel } from './lib/ai-client.ts';
import { scoreArticlesWithAI } from './lib/ai-scoring.ts';
import { summarizeArticles, generateHighlights } from './lib/ai-summary.ts';
import { generateDigestReport } from './lib/report.ts';
import { loadEnvFiles } from './lib/env.ts';

// ============================================================================
// CLI
// ============================================================================

function printUsage(): never {
  console.log(`AI Daily Digest - AI-powered RSS digest from 90 top tech blogs

Usage:
  bun scripts/digest.ts [options]

Options:
  --hours <n>     Time range in hours (default: 48)
  --top-n <n>     Number of top articles to include (default: 15)
  --lang <lang>   Summary language: zh or en (default: zh)
  --output <path> Output file path (default: ./digest-YYYYMMDD.md)
  --fetch-only    Only fetch RSS and save to cache file (no AI needed)
  --cache <path>  Load articles from cache file, skip RSS fetching
  --help          Show this help

Environment:
  OPENAI_API_KEY   Required (except with --fetch-only). API key for OpenAI-compatible service
  OPENAI_API_BASE  Optional base URL (default: https://api.openai.com/v1)
  OPENAI_MODEL     Optional model name (default: deepseek-chat for DeepSeek base, else gpt-4o-mini)
  .env/.env.local  Auto-loaded from current working directory (shell env takes precedence)

Examples:
  # Full pipeline (default)
  bun scripts/digest.ts --hours 24 --top-n 10 --lang zh

  # Two-stage: fetch first, then score (AI failures won't require re-fetching)
  bun scripts/digest.ts --hours 24 --fetch-only --output ./cache.json
  bun scripts/digest.ts --cache ./cache.json --top-n 15 --lang zh --output ./digest.md
`);
  process.exit(0);
}

function parseArgs(argv: string[]): {
  hours: number;
  topN: number;
  lang: 'zh' | 'en';
  outputPath: string;
  fetchOnly: boolean;
  cachePath: string;
} {
  let hours = 48;
  let topN = 15;
  let lang: 'zh' | 'en' = 'zh';
  let outputPath = '';
  let fetchOnly = false;
  let cachePath = '';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--hours' && argv[i + 1]) {
      hours = parseInt(argv[++i]!, 10);
    } else if (arg === '--top-n' && argv[i + 1]) {
      topN = parseInt(argv[++i]!, 10);
    } else if (arg === '--lang' && argv[i + 1]) {
      lang = argv[++i] as 'zh' | 'en';
    } else if (arg === '--output' && argv[i + 1]) {
      outputPath = argv[++i]!;
    } else if (arg === '--fetch-only') {
      fetchOnly = true;
    } else if (arg === '--cache' && argv[i + 1]) {
      cachePath = argv[++i]!;
    }
  }

  if (!outputPath) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    outputPath = fetchOnly ? `./cache-${dateStr}.json` : `./digest-${dateStr}.md`;
  }

  return { hours, topN, lang, outputPath, fetchOnly, cachePath };
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  await loadEnvFiles();

  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) printUsage();

  const { hours, topN, lang, outputPath, fetchOnly, cachePath } = parseArgs(args);

  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiApiBase = process.env.OPENAI_API_BASE;
  const openaiModel = process.env.OPENAI_MODEL;

  if (!fetchOnly && !openaiApiKey) {
    console.error('[digest] Error: Missing OPENAI_API_KEY. Set it to an OpenAI-compatible API key.');
    process.exit(1);
  }

  if (fetchOnly && cachePath) {
    console.error('[digest] Error: --fetch-only and --cache are mutually exclusive.');
    process.exit(1);
  }

  console.log(`[digest] === AI Daily Digest ===`);
  console.log(`[digest] Mode: ${fetchOnly ? 'fetch-only' : cachePath ? 'from-cache' : 'full'}`);
  console.log(`[digest] Time range: ${hours} hours`);
  console.log(`[digest] Top N: ${topN}`);
  console.log(`[digest] Language: ${lang}`);
  console.log(`[digest] Output: ${outputPath}`);
  if (!fetchOnly) {
    const resolvedBase = (openaiApiBase?.trim() || OPENAI_DEFAULT_API_BASE).replace(/\/+$/, '');
    const resolvedModel = openaiModel?.trim() || inferOpenAIModel(resolvedBase);
    console.log(`[digest] AI provider: ${resolvedBase} (model=${resolvedModel})`);
  }
  console.log('');

  // ── Fetch or load articles ──
  let recentArticles: Article[];
  let cacheStats: { totalFeeds: number; successFeeds: number; totalArticles: number };

  if (cachePath) {
    console.log(`[digest] Loading articles from cache: ${cachePath}`);
    const raw = await readFile(cachePath, 'utf-8');
    const cache = JSON.parse(raw) as ArticleCache;
    if (cache.version !== 1) {
      console.error(`[digest] Error: Unsupported cache version: ${cache.version}`);
      process.exit(1);
    }
    recentArticles = cache.articles.map(a => ({ ...a, pubDate: new Date(a.pubDate) }));
    cacheStats = {
      totalFeeds: cache.totalFeeds,
      successFeeds: cache.successFeeds,
      totalArticles: cache.totalArticles,
    };
    console.log(`[digest] Loaded ${recentArticles.length} articles from cache (created: ${cache.createdAt})`);
  } else {
    console.log(`[digest] Step 1/5: Fetching ${RSS_FEEDS.length} RSS feeds...`);
    const fetchResult = await fetchAllFeeds(RSS_FEEDS);

    if (fetchResult.articles.length === 0) {
      console.error('[digest] Error: No articles fetched from any feed. Check network connection.');
      process.exit(1);
    }

    console.log(`[digest] Step 2/5: Filtering by time range (${hours} hours)...`);
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    recentArticles = fetchResult.articles.filter(a => a.pubDate.getTime() > cutoffTime.getTime());

    console.log(`[digest] Found ${recentArticles.length} articles within last ${hours} hours`);

    if (recentArticles.length === 0) {
      console.error(`[digest] Error: No articles found within the last ${hours} hours.`);
      console.error(`[digest] Try increasing --hours (e.g., --hours 168 for one week)`);
      process.exit(1);
    }

    cacheStats = {
      totalFeeds: RSS_FEEDS.length,
      successFeeds: fetchResult.successCount,
      totalArticles: fetchResult.articles.length,
    };

    if (fetchOnly) {
      const cache: ArticleCache = {
        version: 1,
        createdAt: new Date().toISOString(),
        params: { hours },
        totalFeeds: cacheStats.totalFeeds,
        successFeeds: cacheStats.successFeeds,
        totalArticles: cacheStats.totalArticles,
        failedFeeds: fetchResult.failedFeeds.length > 0 ? fetchResult.failedFeeds : undefined,
        articles: recentArticles.map(a => ({ ...a, pubDate: a.pubDate.toISOString() })),
      };
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(cache, null, 2));
      console.log('');
      console.log(`[digest] \u2705 Fetch done!`);
      console.log(`[digest] \u{1F4C1} Cache: ${outputPath}`);
      console.log(`[digest] \u{1F4CA} Stats: ${cacheStats.successFeeds} sources \u2192 ${cacheStats.totalArticles} articles \u2192 ${recentArticles.length} recent`);
      if (fetchResult.failedFeeds.length > 0) {
        console.log(`[digest] \u26A0\uFE0F  ${fetchResult.failedFeeds.length} feeds failed (details in cache file):`);
        for (const f of fetchResult.failedFeeds) {
          console.log(`[digest]   - ${f.name}: ${f.error}`);
        }
      }
      return;
    }
  }

  // ── AI scoring + summarization + report ──
  const aiClient = createAIClient({
    openaiApiKey: openaiApiKey!,
    openaiApiBase,
    openaiModel,
  });

  console.log(`[digest] Step 3/5: AI scoring ${recentArticles.length} articles...`);
  const scores = await scoreArticlesWithAI(recentArticles, aiClient);

  const scoredArticles = recentArticles.map((article, index) => {
    const score = scores.get(index) || { relevance: 5, quality: 5, timeliness: 5, category: 'other' as CategoryId, keywords: [] };
    return {
      ...article,
      totalScore: score.relevance + score.quality + score.timeliness,
      breakdown: score,
    };
  });

  scoredArticles.sort((a, b) => b.totalScore - a.totalScore);
  const topArticles = scoredArticles.slice(0, topN);

  console.log(`[digest] Top ${topN} articles selected (score range: ${topArticles[topArticles.length - 1]?.totalScore || 0} - ${topArticles[0]?.totalScore || 0})`);

  console.log(`[digest] Step 4/5: Generating AI summaries...`);
  const indexedTopArticles = topArticles.map((a, i) => ({ ...a, index: i }));
  const summaries = await summarizeArticles(indexedTopArticles, aiClient, lang);

  const finalArticles: ScoredArticle[] = topArticles.map((a, i) => {
    const sm = summaries.get(i) || { titleZh: a.title, summary: a.description.slice(0, 200), reason: '' };
    return {
      title: a.title,
      link: a.link,
      pubDate: a.pubDate,
      description: a.description,
      sourceName: a.sourceName,
      sourceUrl: a.sourceUrl,
      score: a.totalScore,
      scoreBreakdown: {
        relevance: a.breakdown.relevance,
        quality: a.breakdown.quality,
        timeliness: a.breakdown.timeliness,
      },
      category: a.breakdown.category,
      keywords: a.breakdown.keywords,
      titleZh: sm.titleZh,
      summary: sm.summary,
      reason: sm.reason,
    };
  });

  console.log(`[digest] Step 5/5: Generating today's highlights...`);
  const highlights = await generateHighlights(finalArticles, aiClient, lang);

  const report = generateDigestReport(finalArticles, highlights, {
    totalFeeds: cacheStats.totalFeeds,
    successFeeds: cacheStats.successFeeds,
    totalArticles: cacheStats.totalArticles,
    filteredArticles: recentArticles.length,
    hours,
    lang,
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, report);

  console.log('');
  console.log(`[digest] \u2705 Done!`);
  console.log(`[digest] \u{1F4C1} Report: ${outputPath}`);
  console.log(`[digest] \u{1F4CA} Stats: ${cacheStats.successFeeds} sources \u2192 ${cacheStats.totalArticles} articles \u2192 ${recentArticles.length} recent \u2192 ${finalArticles.length} selected`);

  if (finalArticles.length > 0) {
    console.log('');
    console.log(`[digest] \u{1F3C6} Top 3 Preview:`);
    for (let i = 0; i < Math.min(3, finalArticles.length); i++) {
      const a = finalArticles[i];
      console.log(`  ${i + 1}. ${a.titleZh || a.title}`);
      console.log(`     ${a.summary.slice(0, 80)}...`);
    }
  }
}

await main().catch((err) => {
  console.error(`[digest] Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
