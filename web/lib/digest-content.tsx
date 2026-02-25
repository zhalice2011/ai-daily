import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import Mermaid from './mermaid';
import TocNav from './toc-nav';
import { extractToc, type TocItem } from './toc';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getTextContent).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return getTextContent((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return '';
}

export default function DigestContent({ content }: { content: string }) {
  const toc: TocItem[] = extractToc(content);

  // Track heading counts for duplicate slug disambiguation
  const seenSlugs = new Map<string, number>();

  const components: Components = {
    h2({ children, ...props }) {
      const text = getTextContent(children);
      let id = slugify(text);
      const count = seenSlugs.get(id) ?? 0;
      if (count > 0) id = `${id}-${count}`;
      seenSlugs.set(id, count + 1);
      return <h2 id={id} {...props}>{children}</h2>;
    },
    h3({ children, ...props }) {
      const text = getTextContent(children);
      let id = slugify(text);
      const count = seenSlugs.get(id) ?? 0;
      if (count > 0) id = `${id}-${count}`;
      seenSlugs.set(id, count + 1);
      return <h3 id={id} {...props}>{children}</h3>;
    },
    pre({ children, ...props }) {
      const child = children as React.ReactElement<{ className?: string }>;
      if (
        child &&
        typeof child === 'object' &&
        'props' in child &&
        typeof child.props.className === 'string' &&
        child.props.className.includes('language-mermaid')
      ) {
        return <>{children}</>;
      }
      return <pre {...props}>{children}</pre>;
    },
    code({ className, children, ...props }) {
      if (className === 'language-mermaid') {
        const chart = String(children).trim();
        return <Mermaid chart={chart} />;
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="digest-layout">
      <aside className="digest-toc">
        <TocNav items={toc} />
      </aside>
      <article className="prose prose-themed max-w-none digest-article">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
