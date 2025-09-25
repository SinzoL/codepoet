'use client';

import { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createRoot } from 'react-dom/client';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (!pre) return;

      const className = codeBlock.className;
      const languageMatch = className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'text';
      const code = codeBlock.textContent || '';
      
      const container = document.createElement('div');
      container.style.margin = '1.5rem 0';
      
      pre.parentNode?.insertBefore(container, pre);
      pre.remove();
      
      const root = createRoot(container);
      root.render(
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{
            style: {
              fontSize: '0.875rem',
              fontFamily: 'var(--font-geist-mono), Consolas, Monaco, monospace',
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    });
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}