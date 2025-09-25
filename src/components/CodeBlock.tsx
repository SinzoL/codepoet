'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  // 从className中提取语言信息，格式通常是 "language-javascript"
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  return (
    <SyntaxHighlighter
      style={oneDark}
      language={language}
      PreTag="div"
      customStyle={{
        margin: '1.5rem 0',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
      codeTagProps={{
        style: {
          fontSize: '0.875rem',
          fontFamily: 'var(--font-geist-mono), Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
        }
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
}