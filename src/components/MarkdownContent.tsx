'use client';

import { useEffect, useRef } from 'react';
import 'prismjs/themes/prism.css';

interface MarkdownContentProps {
  content: string;
}

// 生成标题 ID 的辅助函数
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .trim();
};

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // 用 Prism 就地高亮代码块，避免多根渲染/水合问题
    (async () => {
      const { default: Prism } = await import('prismjs'); // PrismStatic

      const codeBlocks = contentRef.current!.querySelectorAll('pre code');

      codeBlocks.forEach(async (codeBlock) => {
        const pre = codeBlock.parentElement as HTMLElement | null;
        if (!pre) return;

        const className = codeBlock.className || '';
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : 'text';

        // 按需加载语言组件（忽略失败）
        if (language && language !== 'text') {
          try {
            await import(
              /* @vite-ignore */
              `prismjs/components/prism-${language}`
            );
          } catch {
            // 忽略不支持语言的错误
          }
        }

        // 轻量样式，保持与原有视觉一致
        pre.style.backgroundColor = '#f6f8fa';
        pre.style.border = '1px solid #e1e4e8';
        pre.style.borderRadius = '0.5rem';
        pre.style.padding = '1rem';
        pre.style.margin = '1.5rem 0';
        pre.style.overflow = 'auto';

        (codeBlock as HTMLElement).style.fontSize = '0.875rem';
        (codeBlock as HTMLElement).style.lineHeight = '1.5';
        (codeBlock as HTMLElement).style.fontFamily =
          'var(--font-geist-mono), Consolas, Monaco, monospace';

        try {
          Prism.highlightElement(codeBlock as Element);
        } catch {
          // 容错：高亮失败则保留原文本
        }
      });
    })();

    // 为标题添加 ID 属性
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const usedIds = new Set<string>(); // 用于跟踪已使用的 ID

    headings.forEach((heading) => {
      const text = heading.textContent || '';
      let id = generateId(text);

      // 如果 ID 已存在，添加索引后缀确保唯一性
      if (usedIds.has(id)) {
        let counter = 1;
        let uniqueId = `${id}-${counter}`;
        while (usedIds.has(uniqueId)) {
          counter++;
          uniqueId = `${id}-${counter}`;
        }
        id = uniqueId;
      }

      usedIds.add(id);
      heading.id = id;

      // 添加样式类
      const level = parseInt(heading.tagName.charAt(1));
      heading.className = getHeadingClass(level);
    });
  }, [content]);

  // 获取标题样式类
  const getHeadingClass = (level: number): string => {
    const baseClasses = 'font-bold text-gray-900 scroll-mt-20';
    switch (level) {
      case 1: return `text-3xl mt-8 mb-4 ${baseClasses}`;
      case 2: return `text-2xl mt-6 mb-3 ${baseClasses}`;
      case 3: return `text-xl mt-5 mb-2 ${baseClasses}`;
      case 4: return `text-lg mt-4 mb-2 ${baseClasses}`;
      case 5: return `text-base mt-3 mb-2 ${baseClasses}`;
      case 6: return `text-sm mt-3 mb-2 ${baseClasses}`;
      default: return baseClasses;
    }
  };

  return (
    <>
      <div
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}