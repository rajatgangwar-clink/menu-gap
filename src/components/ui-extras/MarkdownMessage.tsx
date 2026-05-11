"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Renders AI chat content as markdown. Tailwind utility classes are applied
// per element so the result stays visually consistent with the surrounding
// glass-dark theme without pulling in @tailwindcss/typography.
const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-foreground" style={{ fontWeight: 700 }}>
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1 text-sm leading-relaxed marker:text-[#B08968]/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 text-sm leading-relaxed marker:text-[#B08968]/70">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  h1: ({ children }) => (
    <h1 className="text-base mt-3 mb-1.5 first:mt-0" style={{ fontWeight: 700 }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm mt-3 mb-1.5 first:mt-0" style={{ fontWeight: 700 }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      className="text-sm mt-2.5 mb-1 first:mt-0 text-[#7F5539]"
      style={{ fontWeight: 700 }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      className="text-xs uppercase tracking-wider mt-2.5 mb-1 first:mt-0 text-muted-foreground"
      style={{ fontWeight: 700 }}
    >
      {children}
    </h4>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#B08968] underline underline-offset-2 hover:text-[#7F5539]"
    >
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className} text-xs`} style={{ fontWeight: 500 }}>
          {children}
        </code>
      );
    }
    return (
      <code className="px-1.5 py-0.5 rounded bg-[#FCF8F3] border border-[#E7DED2] text-[12px] text-[#7F5539] font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 p-3 rounded-lg bg-black/40 border border-[#E7DED2] overflow-x-auto text-xs leading-relaxed font-mono">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#E7DED2] pl-3 my-2 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-[#E7DED2]" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#FCF8F3]">{children}</thead>
  ),
  th: ({ children }) => (
    <th
      className="px-2 py-1.5 text-left border border-[#E7DED2] text-muted-foreground uppercase tracking-wider text-[10px]"
      style={{ fontWeight: 600 }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 border border-[#E7DED2] align-top">{children}</td>
  ),
};

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown-message text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
