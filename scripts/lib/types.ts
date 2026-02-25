// ============================================================================
// Constants
// ============================================================================

export const OPENAI_DEFAULT_API_BASE = 'https://api.openai.com/v1';
export const OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';
export const FEED_FETCH_TIMEOUT_MS = 30_000;
export const FEED_CONCURRENCY = 10;
export const FEED_MAX_RETRIES = 2;
export const FEED_RETRY_BASE_MS = 1_000;
export const AI_BATCH_SIZE = 3; // 减少并发, 避免LLM上下文过长  
export const MAX_CONCURRENT_AI = 2;
export const AI_MAX_RETRIES = 2;

// ============================================================================
// Types
// ============================================================================

export type CategoryId = 'ai-ml' | 'security' | 'engineering' | 'tools' | 'opinion' | 'other';

export const CATEGORY_META: Record<CategoryId, { emoji: string; label: string }> = {
  'ai-ml':       { emoji: '\u{1F916}', label: 'AI / ML' },
  'security':    { emoji: '\u{1F512}', label: '\u5B89\u5168' },
  'engineering': { emoji: '\u2699\uFE0F', label: '\u5DE5\u7A0B' },
  'tools':       { emoji: '\u{1F6E0}', label: '\u5DE5\u5177 / \u5F00\u6E90' },
  'opinion':     { emoji: '\u{1F4A1}', label: '\u89C2\u70B9 / \u6742\u8C08' },
  'other':       { emoji: '\u{1F4DD}', label: '\u5176\u4ED6' },
};

export interface Article {
  title: string;
  link: string;
  pubDate: Date;
  description: string;
  sourceName: string;
  sourceUrl: string;
}

export interface ScoredArticle extends Article {
  score: number;
  scoreBreakdown: {
    relevance: number;
    quality: number;
    timeliness: number;
  };
  category: CategoryId;
  keywords: string[];
  titleZh: string;
  summary: string;
  reason: string;
}

export interface ScoringResult {
  results: Array<{
    index: number;
    relevance: number;
    quality: number;
    timeliness: number;
    category: string;
    keywords: string[];
  }>;
}

export interface SummaryResult {
  results: Array<{
    index: number;
    titleZh: string;
    summary: string;
    reason: string;
  }>;
}

export interface AIClient {
  call(prompt: string): Promise<string>;
}

export interface FailedFeed {
  name: string;
  xmlUrl: string;
  error: string;
}

export interface ArticleCache {
  version: 1;
  createdAt: string;
  params: { hours: number };
  totalFeeds: number;
  successFeeds: number;
  totalArticles: number;
  failedFeeds?: FailedFeed[];
  articles: Array<Omit<Article, 'pubDate'> & { pubDate: string }>;
}
