import type { ScoredArticle } from './types.ts';
import { CATEGORY_META } from './types.ts';
import {
  humanizeTime,
} from './visualization.ts';

export function generateDigestReport(articles: ScoredArticle[], highlights: string, stats: {
  totalFeeds: number;
  successFeeds: number;
  totalArticles: number;
  filteredArticles: number;
  hours: number;
  lang: string;
}): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  let report = `# \u{1F4F0} AI \u535A\u5BA2\u6BCF\u65E5\u7CBE\u9009 \u2014 ${dateStr}\n\n`;
  report += `> \u6765\u81EA Karpathy \u63A8\u8350\u7684 ${stats.totalFeeds} \u4E2A\u9876\u7EA7\u6280\u672F\u535A\u5BA2\uFF0CAI \u7CBE\u9009 Top ${articles.length}\n\n`;

  if (highlights) {
    report += `## \u{1F4DD} \u4ECA\u65E5\u770B\u70B9\n\n`;
    report += `${highlights}\n\n`;
    report += `---\n\n`;
  }

  if (articles.length >= 3) {
    report += `## \u{1F3C6} \u4ECA\u65E5\u5FC5\u8BFB\n\n`;
    for (let i = 0; i < Math.min(3, articles.length); i++) {
      const a = articles[i];
      const medal = ['\u{1F947}', '\u{1F948}', '\u{1F949}'][i];
      const catMeta = CATEGORY_META[a.category];

      report += `${medal} **${a.titleZh || a.title}**\n\n`;
      report += `[${a.title}](${a.link}) \u2014 ${a.sourceName} \u00B7 ${humanizeTime(a.pubDate)} \u00B7 ${catMeta.emoji} ${catMeta.label}\n\n`;
      report += `> ${a.summary}\n\n`;
      if (a.reason) {
        report += `\u{1F4A1} **\u4E3A\u4EC0\u4E48\u503C\u5F97\u8BFB**: ${a.reason}\n\n`;
      }
      if (a.keywords.length > 0) {
        report += `\u{1F3F7}\uFE0F ${a.keywords.join(', ')}\n\n`;
      }
    }
    report += `---\n\n`;
  }

  const categoryGroups = new Map<string, ScoredArticle[]>();
  for (const a of articles) {
    const list = categoryGroups.get(a.category) || [];
    list.push(a);
    categoryGroups.set(a.category, list);
  }

  const sortedCategories = Array.from(categoryGroups.entries())
    .sort((a, b) => b[1].length - a[1].length);

  let globalIndex = 0;
  for (const [catId, catArticles] of sortedCategories) {
    const catMeta = CATEGORY_META[catId as keyof typeof CATEGORY_META];
    report += `## ${catMeta.emoji} ${catMeta.label}\n\n`;

    for (const a of catArticles) {
      globalIndex++;
      const scoreTotal = a.scoreBreakdown.relevance + a.scoreBreakdown.quality + a.scoreBreakdown.timeliness;

      report += `### ${globalIndex}. ${a.titleZh || a.title}\n\n`;
      report += `[${a.title}](${a.link}) \u2014 **${a.sourceName}** \u00B7 ${humanizeTime(a.pubDate)} \u00B7 \u2B50 ${scoreTotal}/30\n\n`;
      report += `> ${a.summary}\n\n`;
      if (a.keywords.length > 0) {
        report += `\u{1F3F7}\uFE0F ${a.keywords.join(', ')}\n\n`;
      }
      report += `---\n\n`;
    }
  }

  report += `*\u751F\u6210\u4E8E ${dateStr} ${now.toISOString().split('T')[1]?.slice(0, 5) || ''} | \u626B\u63CF ${stats.successFeeds} \u6E90 \u00B7 \u5171 ${stats.totalArticles} \u7BC7 \u00B7 ${stats.hours}h \u5185\u65B0\u53D1\u5E03 ${stats.filteredArticles} \u7BC7 \u00B7 \u7CBE\u9009 ${articles.length} \u7BC7*\n`;
  report += `*\u57FA\u4E8E [Hacker News Popularity Contest 2025](https://refactoringenglish.com/tools/hn-popularity/) RSS \u6E90\u5217\u8868\uFF0C\u7531 [Andrej Karpathy](https://x.com/karpathy) \u63A8\u8350*\n`;

  return report;
}
