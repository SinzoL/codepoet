'use client';

import { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { createRoot } from 'react-dom/client';

// 自定义温和的代码高亮主题
const customTheme = {
  'code[class*="language-"]': {
    color: '#24292e',
    background: 'none',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none'
  },
  'pre[class*="language-"]': {
    color: '#24292e',
    background: '#f6f8fa',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '1em',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: '4',
    hyphens: 'none',
    padding: '1em',
    margin: '.5em 0',
    overflow: 'auto',
    borderRadius: '0.3em'
  },
  'comment': {
    color: '#6a737d'
  },
  'prolog': {
    color: '#6a737d'
  },
  'doctype': {
    color: '#6a737d'
  },
  'cdata': {
    color: '#6a737d'
  },
  'punctuation': {
    color: '#24292e'
  },
  'property': {
    color: '#005cc5'
  },
  'tag': {
    color: '#22863a'
  },
  'constant': {
    color: '#005cc5'
  },
  'symbol': {
    color: '#005cc5'
  },
  'deleted': {
    color: '#d73a49'
  },
  'boolean': {
    color: '#005cc5'
  },
  'number': {
    color: '#005cc5'
  },
  'selector': {
    color: '#22863a'
  },
  'attr-name': {
    color: '#6f42c1'
  },
  'string': {
    color: '#032f62'
  },
  'char': {
    color: '#032f62'
  },
  'builtin': {
    color: '#e36209'
  },
  'inserted': {
    color: '#22863a'
  },
  'operator': {
    color: '#d73a49'
  },
  'entity': {
    color: '#22863a'
  },
  'url': {
    color: '#22863a'
  },
  'variable': {
    color: '#e36209'
  },
  'atrule': {
    color: '#22863a'
  },
  'attr-value': {
    color: '#032f62'
  },
  'function': {
    color: '#6f42c1'
  },
  'class-name': {
    color: '#6f42c1'
  },
  'keyword': {
    color: '#d73a49'
  },
  'regex': {
    color: '#032f62'
  },
  'important': {
    color: '#d73a49',
    fontWeight: 'bold'
  }
};

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
          style={customTheme}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: '#f6f8fa',
            border: '1px solid #e1e4e8',
            padding: '1rem',
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