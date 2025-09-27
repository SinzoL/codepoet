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

    // 恢复 Prism 代码高亮功能
    (async () => {
      try {
        const { default: Prism } = await import('prismjs');
        
        // 预加载常用语言组件
        await Promise.allSettled([
          import('prismjs/components/prism-javascript'),
          import('prismjs/components/prism-typescript'),
          import('prismjs/components/prism-jsx'),
          import('prismjs/components/prism-tsx'),
          import('prismjs/components/prism-css'),
          import('prismjs/components/prism-json'),
          import('prismjs/components/prism-bash'),
          import('prismjs/components/prism-python'),
        ]);

        const codeBlocks = contentRef.current!.querySelectorAll('pre code');

        codeBlocks.forEach((codeBlock) => {
          const pre = codeBlock.parentElement as HTMLElement | null;
          if (!pre) return;

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
      } catch (error) {
        console.warn('Prism.js loading failed, using fallback styles');
        // 如果Prism加载失败，至少应用基本样式
        const codeBlocks = contentRef.current!.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
          const pre = codeBlock.parentElement as HTMLElement | null;
          if (!pre) return;

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
        });
      }
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

    // 直接为表格元素添加样式，避免使用prose类影响代码高亮
    const tables = contentRef.current.querySelectorAll('table');
    tables.forEach((table) => {
      // 表格样式
      (table as HTMLElement).style.width = '100%';
      (table as HTMLElement).style.tableLayout = 'auto';
      (table as HTMLElement).style.textAlign = 'left';
      (table as HTMLElement).style.marginTop = '2em';
      (table as HTMLElement).style.marginBottom = '2em';
      (table as HTMLElement).style.fontSize = '0.875rem';
      (table as HTMLElement).style.lineHeight = '1.7142857';
      (table as HTMLElement).style.borderCollapse = 'collapse';
      (table as HTMLElement).style.border = '1px solid #e5e7eb';
      (table as HTMLElement).style.borderRadius = '0.5rem';
      (table as HTMLElement).style.overflow = 'hidden';

      // 表头样式
      const thead = table.querySelector('thead');
      if (thead) {
        (thead as HTMLElement).style.backgroundColor = '#f9fafb';
        (thead as HTMLElement).style.borderBottom = '1px solid #e5e7eb';
        
        const ths = thead.querySelectorAll('th');
        ths.forEach((th, index) => {
          (th as HTMLElement).style.color = '#111827';
          (th as HTMLElement).style.fontWeight = '600';
          (th as HTMLElement).style.verticalAlign = 'bottom';
          (th as HTMLElement).style.padding = '0.75rem 1rem';
          if (index < ths.length - 1) {
            (th as HTMLElement).style.borderRight = '1px solid #e5e7eb';
          }
        });
      }

      // 表体样式
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const trs = tbody.querySelectorAll('tr');
        trs.forEach((tr, trIndex) => {
          if (trIndex < trs.length - 1) {
            (tr as HTMLElement).style.borderBottom = '1px solid #f3f4f6';
          }
          
          // 悬停效果
          tr.addEventListener('mouseenter', () => {
            (tr as HTMLElement).style.backgroundColor = '#f9fafb';
          });
          tr.addEventListener('mouseleave', () => {
            (tr as HTMLElement).style.backgroundColor = '';
          });

          const tds = tr.querySelectorAll('td');
          tds.forEach((td, tdIndex) => {
            (td as HTMLElement).style.verticalAlign = 'baseline';
            (td as HTMLElement).style.padding = '0.75rem 1rem';
            if (tdIndex < tds.length - 1) {
              (td as HTMLElement).style.borderRight = '1px solid #f3f4f6';
            }
          });
        });
      }
    });

    // 直接为列表元素添加样式
    const uls = contentRef.current.querySelectorAll('ul');
    uls.forEach((ul) => {
      (ul as HTMLElement).style.listStyleType = 'disc';
      (ul as HTMLElement).style.marginTop = '1.25rem';
      (ul as HTMLElement).style.marginBottom = '1.25rem';
      (ul as HTMLElement).style.paddingLeft = '1.625rem';
    });

    const ols = contentRef.current.querySelectorAll('ol');
    ols.forEach((ol) => {
      (ol as HTMLElement).style.listStyleType = 'decimal';
      (ol as HTMLElement).style.marginTop = '1.25rem';
      (ol as HTMLElement).style.marginBottom = '1.25rem';
      (ol as HTMLElement).style.paddingLeft = '1.625rem';
    });

    const lis = contentRef.current.querySelectorAll('li');
    lis.forEach((li) => {
      (li as HTMLElement).style.marginTop = '0.5rem';
      (li as HTMLElement).style.marginBottom = '0.5rem';
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