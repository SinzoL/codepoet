'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 Prism，减少初始 bundle 大小
const PrismLoader = dynamic(() => import('@/components/PrismLoader'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
});

interface LazyMarkdownContentProps {
  content: string;
  className?: string;
}

// 生成标题 ID 的辅助函数
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

export default function LazyMarkdownContent({ content, className = '' }: LazyMarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    // 使用 Intersection Observer 实现懒加载
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    );

    observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentRef.current || !isVisible) return;

    // 为标题添加 ID 属性
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const usedIds = new Set<string>();

    headings.forEach((heading) => {
      const text = heading.textContent || '';
      let id = generateId(text);

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
  }, [content, isVisible]);

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
    <div ref={contentRef} className={className}>
      {isVisible ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <PrismLoader />
        </>
      ) : (
        // 占位符，防止布局跳动
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      )}
    </div>
  );
}