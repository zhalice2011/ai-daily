# AI Daily Digest

> 本项目参考 [vigorX777/ai-daily-digest](https://github.com/vigorX777/ai-daily-digest) 二次开发。

从 [Andrej Karpathy](https://x.com/karpathy) 推荐的 92 个 Hacker News 顶级技术博客中抓取最新文章，通过 AI 多维评分筛选，生成一份结构化的每日精选日报。支持任意 OpenAI 兼容 API。

> 信息源来自 [Hacker News Popularity Contest 2025](https://refactoringenglish.com/tools/hn-popularity/)，涵盖 simonwillison.net、paulgraham.com、overreacted.io、gwern.net、krebsonsecurity.com 等。

## 快速开始

```bash
cp .env.example .env
# 编辑 .env，填入你的 OPENAI_API_KEY（可选覆盖 OPENAI_API_BASE / OPENAI_MODEL）

npx -y bun scripts/digest.ts --hours 48 --top-n 30 --lang zh --output ./digest.md
```

### CLI 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--hours <n>` | 48 | 文章时间窗口（小时） |
| `--top-n <n>` | 15 | 精选文章数量 |
| `--lang <zh\|en>` | zh | 输出语言 |
| `--output <path>` | `./digest-YYYYMMDD.md` | 输出文件路径 |
| `--fetch-only` | — | 仅抓取 RSS 并保存缓存（不需要 AI Key） |
| `--cache <path>` | — | 从缓存文件加载，跳过 RSS 抓取 |

### 两阶段模式

当 AI 评分因 JSON 解析失败等原因中断时，可以用两阶段模式避免重复抓取 RSS：

```bash
# 阶段 1：抓取 + 过滤 → 缓存文件（不需要 AI Key）
bun scripts/digest.ts --hours 24 --fetch-only --output "./cache-$(date +%Y_%m_%d).json"

# 阶段 2：AI 评分 + 摘要（失败可重跑，无需重新抓取）
bun scripts/digest.ts --cache "./cache-$(date +%Y_%m_%d).json" --top-n 30 --lang zh \
  --output "./web/docs/$(date +%Y_%m_%d).md"
```

## 处理流水线

```
RSS 抓取（92 源，10 路并发，两阶段重试）
  → 时间过滤（--hours）
  → [--fetch-only：保存缓存并退出]
  → [--cache：从缓存加载，跳过上述步骤]
  → AI 评分（每批 10 篇，2 路并发；三维评分 + 分类 + 关键词）
  → AI 摘要（仅 Top N，4-6 句结构化摘要）
  → 趋势总结 + Markdown 报告生成
```

1. **RSS 抓取** — 并发抓取 92 个源（10 路并发，30s 超时），失败源自动进入第二阶段重试（2 路并发，45s 超时），兼容 RSS 2.0 和 Atom 格式
2. **时间过滤** — 按指定时间窗口筛选近期文章
3. **AI 评分** — 从相关性、质量、时效性三个维度打分（1-10），同时完成分类和关键词提取
4. **AI 摘要** — 为 Top N 文章生成结构化摘要（4-6 句）、中文标题翻译、推荐理由
5. **趋势总结** — 归纳当日技术圈 2-3 个宏观趋势

## 日报结构

| 板块 | 内容 |
|------|------|
| 今日看点 | 3-5 句话的宏观趋势总结 |
| 今日必读 | Top 3 深度展示：中英双语标题、摘要、推荐理由、关键词 |
| 数据概览 | 统计表格 + Mermaid 饼图（分类分布）+ Mermaid 柱状图（高频关键词）+ ASCII 纯文本图 + 话题标签云 |
| 分类文章列表 | 按 6 大分类分组，每篇含中文标题、来源、相对时间、评分、摘要、关键词 |

### 六大分类

| 分类 | 覆盖范围 |
|------|----------|
| AI / ML | AI、机器学习、LLM、深度学习 |
| 安全 | 安全、隐私、漏洞、加密 |
| 工程 | 软件工程、架构、编程语言、系统设计 |
| 工具 / 开源 | 开发工具、开源项目、新发布的库/框架 |
| 观点 / 杂谈 | 行业观点、个人思考、职业发展 |
| 其他 | 不属于以上分类的内容 |

## 项目架构

```
scripts/
  digest.ts              # CLI 入口，串联整个流水线
  lib/
    types.ts             # 类型定义与常量
    feeds.ts             # 92 个 RSS 源列表
    fetcher.ts           # RSS 并发抓取 + 两阶段重试
    rss-parser.ts        # 零依赖 RSS/Atom XML 解析（正则实现）
    ai-client.ts         # OpenAI 兼容 API 客户端
    ai-scoring.ts        # AI 三维评分 + 分类 + 关键词
    ai-summary.ts        # AI 摘要 + 标题翻译
    report.ts            # Markdown 报告组装
    visualization.ts     # Mermaid 图表 / ASCII 柱状图 / 标签云
    env.ts               # .env 文件加载器
web/                     # Next.js 15 日报浏览应用
  app/
    page.tsx             # 首页（日报列表）
    digest/[date]/
      page.tsx           # 单篇日报渲染
  lib/
    docs.ts              # 日报文件读取工具
    mermaid.tsx           # Mermaid 图表组件（客户端渲染）
.github/workflows/
  daily-digest.yml       # GitHub Actions 每日定时任务
```

## 环境要求

- [Bun](https://bun.sh) 运行时（通过 `npx -y bun` 自动安装）
- `OPENAI_API_KEY` — 任意 OpenAI 兼容服务的 API Key（使用 `--fetch-only` 时不需要）
- 可选：`OPENAI_API_BASE`（自定义 endpoint）、`OPENAI_MODEL`（指定模型）
- 脚本会自动加载当前目录 `.env` 和 `.env.local`（shell 已设置的同名变量优先）

## 支持的 AI 提供商

通过 OpenAI 兼容接口调用 LLM，支持所有兼容 Chat Completions 格式的服务：

| 提供商 | `OPENAI_API_BASE` | `OPENAI_MODEL` |
|--------|-------------------|----------------|
| OpenAI | `https://api.openai.com/v1`（默认） | `gpt-4o-mini`（默认） |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat`（自动推断） |
| Groq | `https://api.groq.com/openai/v1` | 需手动指定 |
| Together AI | `https://api.together.xyz/v1` | 需手动指定 |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 需手动指定 |

## 信息源

92 个 RSS 源精选自 Hacker News 社区最受欢迎的独立技术博客，包括但不限于：

> Simon Willison · Paul Graham · Dan Abramov · Gwern · Krebs on Security · Antirez · John Gruber · Troy Hunt · Mitchell Hashimoto · Steve Blank · Eli Bendersky · Fabien Sanglard ...

完整列表见 `scripts/lib/feeds.ts`。

## GitHub Actions 自动化

项目配置了 GitHub Actions，每天自动生成日报并提交到 `docs/` 目录。

- **触发时间**：每天 UTC 06:00（北京时间 14:00）
- **手动触发**：仓库 Actions 页面 → Daily Digest → Run workflow
- **输出路径**：`docs/YYYY_MM_DD.md`
- **时间窗口**：`--hours 28`（比 24h 多 4h，防止 cron 偏差遗漏文章）

### 配置 Secrets

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret | 必填 | 说明 |
|--------|------|------|
| `OPENAI_API_KEY` | 是 | OpenAI 兼容服务的 API Key |
| `OPENAI_API_BASE` | 否 | 自定义 API endpoint |
| `OPENAI_MODEL` | 否 | 指定模型名 |

## Web 展示

`web/` 目录下是一个 Next.js 15 应用，用于在浏览器中展示 `docs/` 下的所有日报。

### 本地开发

```bash
cd web
npm install
npm run dev
```

确保 `docs/` 目录下至少有一个 `YYYY_MM_DD.md` 文件（可先手动运行脚本生成），然后访问 `http://localhost:3000`。

### 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 中 Import 本仓库
2. **Root Directory** 设为 `web/`
3. Framework 自动检测为 Next.js，直接部署

每次 GitHub Actions 生成新日报并 push 后，Vercel 会自动触发重新部署。

### 技术栈

| 项 | 选择 |
|---|---|
| 框架 | Next.js 15 (App Router)，React 19 |
| Markdown 渲染 | react-markdown + remark-gfm + rehype-raw |
| 图表 | Mermaid v11（客户端渲染） |
| 样式 | Tailwind CSS v4 + @tailwindcss/typography |
