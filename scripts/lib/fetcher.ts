import type { Article, FailedFeed } from './types.ts';
import {
  FEED_FETCH_TIMEOUT_MS,
  FEED_CONCURRENCY,
  FEED_MAX_RETRIES,
  FEED_RETRY_BASE_MS,
} from './types.ts';
import { parseRSSItems, parseDate } from './rss-parser.ts';

const RETRY_PHASE2_CONCURRENCY = 2;
const RETRY_PHASE2_TIMEOUT_MS = 45_000;
const RETRY_PHASE2_MAX_RETRIES = 3;

function isRetryable(error: unknown): boolean {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return msg.includes('abort')
    || msg.includes('timeout')
    || msg.includes('timed out')
    || msg.includes('socket connection was closed')
    || msg.includes('econnreset')
    || msg.includes('econnrefused')
    || msg.includes('epipe')
    || msg.includes('eof')
    || msg.includes('tls')
    || msg.includes('ssl')
    || msg.includes('certificate')
    || msg.includes('unable to get local issuer')
    || msg.includes('network')
    || msg.includes('fetch failed')
    || /http 5\d{2}/.test(msg);
}

interface FeedResult {
  articles: Article[];
  error?: string;
}

async function fetchFeed(
  feed: { name: string; xmlUrl: string; htmlUrl: string },
  timeoutMs: number = FEED_FETCH_TIMEOUT_MS,
  maxRetries: number = FEED_MAX_RETRIES,
): Promise<FeedResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = FEED_RETRY_BASE_MS * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(feed.xmlUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xml = await response.text();
      const items = parseRSSItems(xml);

      return {
        articles: items.map(item => ({
          title: item.title,
          link: item.link,
          pubDate: parseDate(item.pubDate) || new Date(0),
          description: item.description,
          sourceName: feed.name,
          sourceUrl: feed.htmlUrl,
        })),
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries && isRetryable(error)) {
        continue;
      }
      break;
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  if (!msg.includes('abort')) {
    console.warn(`[digest] \u2717 ${feed.name}: ${msg}`);
  } else {
    console.warn(`[digest] \u2717 ${feed.name}: timeout`);
  }
  return { articles: [], error: msg };
}

export interface FetchAllResult {
  articles: Article[];
  successCount: number;
  failCount: number;
  failedFeeds: FailedFeed[];
}

export async function fetchAllFeeds(feeds: Array<{ name: string; xmlUrl: string; htmlUrl: string }>): Promise<FetchAllResult> {
  const allArticles: Article[] = [];
  let successCount = 0;
  let failCount = 0;
  const failedFeedEntries: Array<{ name: string; xmlUrl: string; htmlUrl: string; error: string }> = [];

  // Phase 1
  for (let i = 0; i < feeds.length; i += FEED_CONCURRENCY) {
    const batch = feeds.slice(i, i + FEED_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(f => fetchFeed(f)));

    for (let j = 0; j < results.length; j++) {
      const result = results[j]!;
      const feed = batch[j]!;
      if (result.status === 'fulfilled' && result.value.articles.length > 0) {
        allArticles.push(...result.value.articles);
        successCount++;
      } else {
        const errorMsg = result.status === 'fulfilled'
          ? (result.value.error || 'no articles')
          : (result.reason instanceof Error ? result.reason.message : String(result.reason));
        failedFeedEntries.push({ ...feed, error: errorMsg });
        failCount++;
      }
    }

    const progress = Math.min(i + FEED_CONCURRENCY, feeds.length);
    console.log(`[digest] Progress: ${progress}/${feeds.length} feeds processed (${successCount} ok, ${failCount} failed)`);
  }

  console.log(`[digest] Phase 1 done: ${allArticles.length} articles from ${successCount} feeds (${failCount} failed)`);

  // Phase 2: retry failed feeds
  if (failedFeedEntries.length > 0) {
    console.log(`[digest] Phase 2: Retrying ${failedFeedEntries.length} failed feeds (concurrency=${RETRY_PHASE2_CONCURRENCY}, timeout=${RETRY_PHASE2_TIMEOUT_MS}ms)...`);

    const stillFailed: FailedFeed[] = [];

    for (let i = 0; i < failedFeedEntries.length; i += RETRY_PHASE2_CONCURRENCY) {
      const batch = failedFeedEntries.slice(i, i + RETRY_PHASE2_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(f => fetchFeed(f, RETRY_PHASE2_TIMEOUT_MS, RETRY_PHASE2_MAX_RETRIES))
      );

      for (let j = 0; j < results.length; j++) {
        const result = results[j]!;
        const feed = batch[j]!;
        if (result.status === 'fulfilled' && result.value.articles.length > 0) {
          allArticles.push(...result.value.articles);
          successCount++;
          failCount--;
          console.log(`[digest] \u2713 Phase 2 recovered: ${feed.name}`);
        } else {
          const errorMsg = result.status === 'fulfilled'
            ? (result.value.error || 'no articles')
            : (result.reason instanceof Error ? result.reason.message : String(result.reason));
          stillFailed.push({ name: feed.name, xmlUrl: feed.xmlUrl, error: errorMsg });
        }
      }
    }

    if (stillFailed.length > 0) {
      console.log(`[digest] Phase 2 done: ${failedFeedEntries.length - stillFailed.length} recovered, ${stillFailed.length} still failed`);
    } else {
      console.log(`[digest] Phase 2 done: all ${failedFeedEntries.length} feeds recovered!`);
    }

    console.log(`[digest] Fetched ${allArticles.length} articles from ${successCount} feeds (${failCount} failed)`);
    return { articles: allArticles, successCount, failCount, failedFeeds: stillFailed };
  }

  console.log(`[digest] Fetched ${allArticles.length} articles from ${successCount} feeds (${failCount} failed)`);
  return { articles: allArticles, successCount, failCount, failedFeeds: [] };
}
