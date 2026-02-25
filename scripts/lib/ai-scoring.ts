import type { Article, AIClient, CategoryId, ScoringResult } from './types.ts';
import { AI_BATCH_SIZE, MAX_CONCURRENT_AI, AI_MAX_RETRIES } from './types.ts';
import { parseJsonResponse } from './ai-client.ts';

function buildScoringPrompt(articles: Array<{ index: number; title: string; description: string; sourceName: string }>): string {
  const articlesList = articles.map(a =>
    `Index ${a.index}: [${a.sourceName}] ${a.title}\n${a.description.slice(0, 300)}`
  ).join('\n\n---\n\n');

  return `\u4F60\u662F\u4E00\u4E2A\u6280\u672F\u5185\u5BB9\u7B56\u5C55\u4EBA\uFF0C\u6B63\u5728\u4E3A\u4E00\u4EFD\u9762\u5411\u6280\u672F\u7231\u597D\u8005\u7684\u6BCF\u65E5\u7CBE\u9009\u6458\u8981\u7B5B\u9009\u6587\u7AE0\u3002

\u8BF7\u5BF9\u4EE5\u4E0B\u6587\u7AE0\u8FDB\u884C\u4E09\u4E2A\u7EF4\u5EA6\u7684\u8BC4\u5206\uFF081-10 \u6574\u6570\uFF0C10 \u5206\u6700\u9AD8\uFF09\uFF0C\u5E76\u4E3A\u6BCF\u7BC7\u6587\u7AE0\u5206\u914D\u4E00\u4E2A\u5206\u7C7B\u6807\u7B7E\u548C\u63D0\u53D6 2-4 \u4E2A\u5173\u952E\u8BCD\u3002

## \u8BC4\u5206\u7EF4\u5EA6

### 1. \u76F8\u5173\u6027 (relevance) - \u5BF9\u6280\u672F/\u7F16\u7A0B/AI/\u4E92\u8054\u7F51\u4ECE\u4E1A\u8005\u7684\u4EF7\u503C
- 10: \u6240\u6709\u6280\u672F\u4EBA\u90FD\u5E94\u8BE5\u77E5\u9053\u7684\u91CD\u5927\u4E8B\u4EF6/\u7A81\u7834
- 7-9: \u5BF9\u5927\u90E8\u5206\u6280\u672F\u4ECE\u4E1A\u8005\u6709\u4EF7\u503C
- 4-6: \u5BF9\u7279\u5B9A\u6280\u672F\u9886\u57DF\u6709\u4EF7\u503C
- 1-3: \u4E0E\u6280\u672F\u884C\u4E1A\u5173\u8054\u4E0D\u5927

### 2. \u8D28\u91CF (quality) - \u6587\u7AE0\u672C\u8EAB\u7684\u6DF1\u5EA6\u548C\u5199\u4F5C\u8D28\u91CF
- 10: \u6DF1\u5EA6\u5206\u6790\uFF0C\u539F\u521B\u6D1E\u89C1\uFF0C\u5F15\u7528\u4E30\u5BCC
- 7-9: \u6709\u6DF1\u5EA6\uFF0C\u89C2\u70B9\u72EC\u5230
- 4-6: \u4FE1\u606F\u51C6\u786E\uFF0C\u8868\u8FBE\u6E05\u6670
- 1-3: \u6D45\u5C1D\u8F84\u6B62\u6216\u7EAF\u8F6C\u8FF0

### 3. \u65F6\u6548\u6027 (timeliness) - \u5F53\u524D\u662F\u5426\u503C\u5F97\u9605\u8BFB
- 10: \u6B63\u5728\u53D1\u751F\u7684\u91CD\u5927\u4E8B\u4EF6/\u521A\u53D1\u5E03\u7684\u91CD\u8981\u5DE5\u5177
- 7-9: \u8FD1\u671F\u70ED\u70B9\u76F8\u5173
- 4-6: \u5E38\u9752\u5185\u5BB9\uFF0C\u4E0D\u8FC7\u65F6
- 1-3: \u8FC7\u65F6\u6216\u65E0\u65F6\u6548\u4EF7\u503C

## \u5206\u7C7B\u6807\u7B7E\uFF08\u5FC5\u987B\u4ECE\u4EE5\u4E0B\u9009\u4E00\u4E2A\uFF09
- ai-ml: AI\u3001\u673A\u5668\u5B66\u4E60\u3001LLM\u3001\u6DF1\u5EA6\u5B66\u4E60\u76F8\u5173
- security: \u5B89\u5168\u3001\u9690\u79C1\u3001\u6F0F\u6D1E\u3001\u52A0\u5BC6\u76F8\u5173
- engineering: \u8F6F\u4EF6\u5DE5\u7A0B\u3001\u67B6\u6784\u3001\u7F16\u7A0B\u8BED\u8A00\u3001\u7CFB\u7EDF\u8BBE\u8BA1
- tools: \u5F00\u53D1\u5DE5\u5177\u3001\u5F00\u6E90\u9879\u76EE\u3001\u65B0\u53D1\u5E03\u7684\u5E93/\u6846\u67B6
- opinion: \u884C\u4E1A\u89C2\u70B9\u3001\u4E2A\u4EBA\u601D\u8003\u3001\u804C\u4E1A\u53D1\u5C55\u3001\u6587\u5316\u8BC4\u8BBA
- other: \u4EE5\u4E0A\u90FD\u4E0D\u592A\u9002\u5408\u7684

## \u5173\u952E\u8BCD\u63D0\u53D6
\u63D0\u53D6 2-4 \u4E2A\u6700\u80FD\u4EE3\u8868\u6587\u7AE0\u4E3B\u9898\u7684\u5173\u952E\u8BCD\uFF08\u7528\u82F1\u6587\uFF0C\u7B80\u77ED\uFF0C\u5982 "Rust", "LLM", "database", "performance"\uFF09

## \u5F85\u8BC4\u5206\u6587\u7AE0

${articlesList}

\u8BF7\u4E25\u683C\u6309 JSON \u683C\u5F0F\u8FD4\u56DE\uFF0C\u4E0D\u8981\u5305\u542B markdown \u4EE3\u7801\u5757\u6216\u5176\u4ED6\u6587\u5B57\uFF1A
{
  "results": [
    {
      "index": 0,
      "relevance": 8,
      "quality": 7,
      "timeliness": 9,
      "category": "engineering",
      "keywords": ["Rust", "compiler", "performance"]
    }
  ]
}`;
}

export async function scoreArticlesWithAI(
  articles: Article[],
  aiClient: AIClient
): Promise<Map<number, { relevance: number; quality: number; timeliness: number; category: CategoryId; keywords: string[] }>> {
  const allScores = new Map<number, { relevance: number; quality: number; timeliness: number; category: CategoryId; keywords: string[] }>();

  const indexed = articles.map((article, index) => ({
    index,
    title: article.title,
    description: article.description,
    sourceName: article.sourceName,
  }));

  const batches: typeof indexed[] = [];
  for (let i = 0; i < indexed.length; i += AI_BATCH_SIZE) {
    batches.push(indexed.slice(i, i + AI_BATCH_SIZE));
  }

  console.log(`[digest] AI scoring: ${articles.length} articles in ${batches.length} batches`);

  const validCategories = new Set<string>(['ai-ml', 'security', 'engineering', 'tools', 'opinion', 'other']);

  for (let i = 0; i < batches.length; i += MAX_CONCURRENT_AI) {
    const batchGroup = batches.slice(i, i + MAX_CONCURRENT_AI);
    const promises = batchGroup.map(async (batch) => {
      const prompt = buildScoringPrompt(batch);
      let lastError: Error | undefined;
      for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
        try {
          const responseText = await aiClient.call(prompt);
          const parsed = parseJsonResponse<ScoringResult>(responseText);

          if (parsed.results && Array.isArray(parsed.results)) {
            for (const result of parsed.results) {
              const clamp = (v: number) => Math.min(10, Math.max(1, Math.round(v)));
              const cat = (validCategories.has(result.category) ? result.category : 'other') as CategoryId;
              allScores.set(result.index, {
                relevance: clamp(result.relevance),
                quality: clamp(result.quality),
                timeliness: clamp(result.timeliness),
                category: cat,
                keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 4) : [],
              });
            }
          }
          return; // success
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < AI_MAX_RETRIES) {
            console.warn(`[digest] Scoring batch attempt ${attempt + 1} failed: ${lastError.message}, retrying...`);
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      console.warn(`[digest] Scoring batch failed after ${AI_MAX_RETRIES + 1} attempts: ${lastError!.message}`);
      for (const item of batch) {
        allScores.set(item.index, { relevance: 5, quality: 5, timeliness: 5, category: 'other', keywords: [] });
      }
    });

    await Promise.all(promises);
    console.log(`[digest] Scoring progress: ${Math.min(i + MAX_CONCURRENT_AI, batches.length)}/${batches.length} batches`);
  }

  return allScores;
}
