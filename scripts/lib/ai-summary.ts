import type { Article, AIClient, ScoredArticle, SummaryResult } from './types.ts';
import { AI_BATCH_SIZE, MAX_CONCURRENT_AI, AI_MAX_RETRIES } from './types.ts';
import { parseJsonResponse } from './ai-client.ts';

function buildSummaryPrompt(
  articles: Array<{ index: number; title: string; description: string; sourceName: string; link: string }>,
  lang: 'zh' | 'en'
): string {
  const articlesList = articles.map(a =>
    `Index ${a.index}: [${a.sourceName}] ${a.title}\nURL: ${a.link}\n${a.description.slice(0, 800)}`
  ).join('\n\n---\n\n');

  const langInstruction = lang === 'zh'
    ? '\u8BF7\u7528\u4E2D\u6587\u64B0\u5199\u6458\u8981\u548C\u63A8\u8350\u7406\u7531\u3002\u5982\u679C\u539F\u6587\u662F\u82F1\u6587\uFF0C\u8BF7\u7FFB\u8BD1\u4E3A\u4E2D\u6587\u3002\u6807\u9898\u7FFB\u8BD1\u4E5F\u7528\u4E2D\u6587\u3002'
    : 'Write summaries, reasons, and title translations in English.';

  return `\u4F60\u662F\u4E00\u4E2A\u6280\u672F\u5185\u5BB9\u6458\u8981\u4E13\u5BB6\u3002\u8BF7\u4E3A\u4EE5\u4E0B\u6587\u7AE0\u5B8C\u6210\u4E09\u4EF6\u4E8B\uFF1A

1. **\u4E2D\u6587\u6807\u9898** (titleZh): \u5C06\u82F1\u6587\u6807\u9898\u7FFB\u8BD1\u6210\u81EA\u7136\u7684\u4E2D\u6587\u3002\u5982\u679C\u539F\u6807\u9898\u5DF2\u7ECF\u662F\u4E2D\u6587\u5219\u4FDD\u6301\u4E0D\u53D8\u3002
2. **\u6458\u8981** (summary): 4-6 \u53E5\u8BDD\u7684\u7ED3\u6784\u5316\u6458\u8981\uFF0C\u8BA9\u8BFB\u8005\u4E0D\u70B9\u8FDB\u539F\u6587\u4E5F\u80FD\u4E86\u89E3\u6838\u5FC3\u5185\u5BB9\u3002\u5305\u542B\uFF1A
   - \u6587\u7AE0\u8BA8\u8BBA\u7684\u6838\u5FC3\u95EE\u9898\u6216\u4E3B\u9898\uFF081 \u53E5\uFF09
   - \u5173\u952E\u8BBA\u70B9\u3001\u6280\u672F\u65B9\u6848\u6216\u53D1\u73B0\uFF082-3 \u53E5\uFF09
   - \u7ED3\u8BBA\u6216\u4F5C\u8005\u7684\u6838\u5FC3\u89C2\u70B9\uFF081 \u53E5\uFF09
3. **\u63A8\u8350\u7406\u7531** (reason): 1 \u53E5\u8BDD\u8BF4\u660E\u201C\u4E3A\u4EC0\u4E48\u503C\u5F97\u8BFB\u201D\uFF0C\u533A\u522B\u4E8E\u6458\u8981\uFF08\u6458\u8981\u8BF4\u201C\u662F\u4EC0\u4E48\u201D\uFF0C\u63A8\u8350\u7406\u7531\u8BF4\u201C\u4E3A\u4EC0\u4E48\u201D\uFF09\u3002

${langInstruction}

\u6458\u8981\u8981\u6C42\uFF1A
- \u76F4\u63A5\u8BF4\u91CD\u70B9\uFF0C\u4E0D\u8981\u7528\u201C\u672C\u6587\u8BA8\u8BBA\u4E86...\u201D\u3001\u201C\u8FD9\u7BC7\u6587\u7AE0\u4ECB\u7ECD\u4E86...\u201D\u8FD9\u79CD\u5F00\u5934
- \u5305\u542B\u5177\u4F53\u7684\u6280\u672F\u540D\u8BCD\u3001\u6570\u636E\u3001\u65B9\u6848\u540D\u79F0\u6216\u89C2\u70B9
- \u4FDD\u7559\u5173\u952E\u6570\u5B57\u548C\u6307\u6807\uFF08\u5982\u6027\u80FD\u63D0\u5347\u767E\u5206\u6BD4\u3001\u7528\u6237\u6570\u3001\u7248\u672C\u53F7\u7B49\uFF09
- \u5982\u679C\u6587\u7AE0\u6D89\u53CA\u5BF9\u6BD4\u6216\u9009\u578B\uFF0C\u8981\u70B9\u51FA\u6BD4\u8F83\u5BF9\u8C61\u548C\u7ED3\u8BBA
- \u76EE\u6807\uFF1A\u8BFB\u8005\u82B1 30 \u79D2\u8BFB\u5B8C\u6458\u8981\uFF0C\u5C31\u80FD\u51B3\u5B9A\u662F\u5426\u503C\u5F97\u82B1 10 \u5206\u949F\u8BFB\u539F\u6587

## \u5F85\u6458\u8981\u6587\u7AE0

${articlesList}

\u8BF7\u4E25\u683C\u6309 JSON \u683C\u5F0F\u8FD4\u56DE\uFF1A
{
  "results": [
    {
      "index": 0,
      "titleZh": "\u4E2D\u6587\u7FFB\u8BD1\u7684\u6807\u9898",
      "summary": "\u6458\u8981\u5185\u5BB9...",
      "reason": "\u63A8\u8350\u7406\u7531..."
    }
  ]
}`;
}

export async function summarizeArticles(
  articles: Array<Article & { index: number }>,
  aiClient: AIClient,
  lang: 'zh' | 'en'
): Promise<Map<number, { titleZh: string; summary: string; reason: string }>> {
  const summaries = new Map<number, { titleZh: string; summary: string; reason: string }>();

  const indexed = articles.map(a => ({
    index: a.index,
    title: a.title,
    description: a.description,
    sourceName: a.sourceName,
    link: a.link,
  }));

  const batches: typeof indexed[] = [];
  for (let i = 0; i < indexed.length; i += AI_BATCH_SIZE) {
    batches.push(indexed.slice(i, i + AI_BATCH_SIZE));
  }

  console.log(`[digest] Generating summaries for ${articles.length} articles in ${batches.length} batches`);

  for (let i = 0; i < batches.length; i += MAX_CONCURRENT_AI) {
    const batchGroup = batches.slice(i, i + MAX_CONCURRENT_AI);
    const promises = batchGroup.map(async (batch) => {
      const prompt = buildSummaryPrompt(batch, lang);
      let lastError: Error | undefined;
      for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
        try {
          const responseText = await aiClient.call(prompt);
          const parsed = parseJsonResponse<SummaryResult>(responseText);

          if (parsed.results && Array.isArray(parsed.results)) {
            for (const result of parsed.results) {
              summaries.set(result.index, {
                titleZh: result.titleZh || '',
                summary: result.summary || '',
                reason: result.reason || '',
              });
            }
          }
          return; // success
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < AI_MAX_RETRIES) {
            console.warn(`[digest] Summary batch attempt ${attempt + 1} failed: ${lastError.message}, retrying...`);
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      console.warn(`[digest] Summary batch failed after ${AI_MAX_RETRIES + 1} attempts: ${lastError!.message}`);
      for (const item of batch) {
        summaries.set(item.index, { titleZh: item.title, summary: item.title, reason: '' });
      }
    });

    await Promise.all(promises);
    console.log(`[digest] Summary progress: ${Math.min(i + MAX_CONCURRENT_AI, batches.length)}/${batches.length} batches`);
  }

  return summaries;
}

export async function generateHighlights(
  articles: ScoredArticle[],
  aiClient: AIClient,
  lang: 'zh' | 'en'
): Promise<string> {
  const articleList = articles.slice(0, 10).map((a, i) =>
    `${i + 1}. [${a.category}] ${a.titleZh || a.title} \u2014 ${a.summary.slice(0, 100)}`
  ).join('\n');

  const langNote = lang === 'zh' ? '\u7528\u4E2D\u6587\u56DE\u7B54\u3002' : 'Write in English.';

  const prompt = `\u6839\u636E\u4EE5\u4E0B\u4ECA\u65E5\u7CBE\u9009\u6280\u672F\u6587\u7AE0\u5217\u8868\uFF0C\u5199\u4E00\u6BB5 3-5 \u53E5\u8BDD\u7684\u201C\u4ECA\u65E5\u770B\u70B9\u201D\u603B\u7ED3\u3002
\u8981\u6C42\uFF1A
- \u63D0\u70BC\u51FA\u4ECA\u5929\u6280\u672F\u5708\u7684 2-3 \u4E2A\u4E3B\u8981\u8D8B\u52BF\u6216\u8BDD\u9898
- \u4E0D\u8981\u9010\u7BC7\u5217\u4E3E\uFF0C\u8981\u505A\u5B8F\u89C2\u5F52\u7EB3
- \u98CE\u683C\u7B80\u6D01\u6709\u529B\uFF0C\u50CF\u65B0\u95FB\u5BFC\u8BED
${langNote}

\u6587\u7AE0\u5217\u8868\uFF1A
${articleList}

\u76F4\u63A5\u8FD4\u56DE\u7EAF\u6587\u672C\u603B\u7ED3\uFF0C\u4E0D\u8981 JSON\uFF0C\u4E0D\u8981 markdown \u683C\u5F0F\u3002`;

  try {
    const text = await aiClient.call(prompt);
    return text.trim();
  } catch (error) {
    console.warn(`[digest] Highlights generation failed: ${error instanceof Error ? error.message : String(error)}`);
    return '';
  }
}
