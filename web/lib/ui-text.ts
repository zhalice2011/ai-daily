const uiText = {
  zh: {
    archives: '全部日报',
    noDigests: '暂无日报',
    noDigestsHint: '等待 GitHub Actions 生成第一份日报...',
    loadFailed: '日报内容加载失败',
    viewAll: '查看全部日报',
    latest: '最新',
    prev: '上一页',
    next: '下一页',
    digest: '日报',
    notFound: '未找到该日期的日报',
    backHome: '返回首页',
    weekly: '周榜',
    monthly: '月榜',
    rankings: '排行榜',
  },
  en: {
    archives: 'Archives',
    noDigests: 'No digests yet',
    noDigestsHint: 'Waiting for GitHub Actions to generate the first digest...',
    loadFailed: 'Failed to load digest',
    viewAll: 'View All Digests',
    latest: 'Latest',
    prev: 'Prev',
    next: 'Next',
    digest: 'Digest',
    notFound: 'Digest not found for this date',
    backHome: 'Back to Home',
    weekly: 'Weekly',
    monthly: 'Monthly',
    rankings: 'Rankings',
  },
} as const;

export type Lang = 'zh' | 'en';

export function getUiText(lang?: string) {
  return lang === 'en' ? uiText.en : uiText.zh;
}
