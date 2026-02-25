# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Daily Digest — a zero-dependency, single-file TypeScript tool that fetches RSS from 90 curated Hacker News blogs, uses AI to score/filter/summarize articles, and generates a structured Markdown daily digest.

## Running the Script

```bash
npx -y bun scripts/digest.ts --hours 48 --top-n 15 --lang zh --output ./output/digest-$(date +%Y%m%d).md
```

### CLI Arguments

| Flag | Default | Description |
|------|---------|-------------|
| `--hours <n>` | 48 | Time range for article filtering |
| `--top-n <n>` | 15 | Number of top articles to include |
| `--lang <zh\|en>` | zh | Output language |
| `--output <path>` | `./digest-YYYYMMDD.md` | Output file path |
| `--fetch-only` | — | Only fetch RSS and save to cache file (no AI key needed) |
| `--cache <path>` | — | Load articles from cache file, skip RSS fetching |

### Two-Stage Mode

When AI scoring fails (e.g. JSON parse errors from unreliable API), use two-stage mode to avoid re-fetching RSS:

```bash
# Stage 1: fetch + filter → cache file
bun scripts/digest.ts --hours 24 --fetch-only --output ./cache.json

# Stage 2: AI score + summarize from cache (can re-run on failure)
bun scripts/digest.ts --cache ./cache.json --top-n 15 --lang zh --output ./digest.md
```

### Required Environment Variables

- `OPENAI_API_KEY` — required (except with `--fetch-only`), API key for any OpenAI-compatible service
- `OPENAI_API_BASE` — optional endpoint, e.g. `https://api.deepseek.com/v1` (default: `https://api.openai.com/v1`)
- `OPENAI_MODEL` — optional model name, auto-inferred from base URL if omitted

## Architecture

Everything lives in `scripts/digest.ts` (~1185 lines). The pipeline is sequential:

```
RSS Fetch (90 feeds, 10 concurrent, 15s timeout)
  → Time Filter (--hours)
  → [--fetch-only: save cache JSON and exit]
  → [--cache: load from cache JSON, skip above]
  → AI Scoring (batch of 10, 2 concurrent AI calls; 3-dimension scoring + categorization)
  → AI Summarization (top-N only, 4-6 sentence summaries)
  → Trend Highlights + Markdown Report Generation
```

### Key sections in digest.ts

| Lines (approx) | Module |
|-----------------|--------|
| 1-170 | Constants, RSS feed list, type definitions |
| 179-291 | RSS/Atom XML parsing (manual regex, no dependencies) |
| 297-363 | Concurrent feed fetching with timeout |
| 369-460 | AI provider abstraction (OpenAI-compatible) |
| 508-623 | AI scoring — relevance/quality/timeliness + category + keywords |
| 629-728 | AI summarization with translation |
| 770-882 | Visualization (Mermaid charts, ASCII bars, tag cloud) |
| 888-995 | Markdown report assembly |
| 996+ | CLI argument parsing and main() |

### Core Data Types

- `Article` — raw parsed RSS item (title, link, pubDate, description, source)
- `ScoredArticle extends Article` — adds score, scoreBreakdown, category, keywords, titleZh, summary, reason
- `CategoryId` — one of: `ai-ml`, `security`, `engineering`, `tools`, `opinion`, `other`

### AI Provider

The script uses OpenAI-compatible Chat Completions API. Configure via `OPENAI_API_KEY`, `OPENAI_API_BASE`, and `OPENAI_MODEL` environment variables. The model is auto-inferred from the base URL when not specified (e.g., DeepSeek endpoint → `deepseek-chat`).

## Key Design Decisions

- **Zero external dependencies** — only Bun runtime + Node.js stdlib (`fs/promises`, `path`, `process`)
- **Single-file monolith** — intentionally portable; no build step, no package.json
- **Manual XML parsing** — regex-based RSS/Atom parsing to avoid dependency on an XML library
- **Persistent config** — saved at `~/.hn-daily-digest/config.json` for reuse across runs

## No Tests

There is currently no test framework or test suite in this project.
