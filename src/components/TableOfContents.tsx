'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// 生成标题 ID 的辅助函数（与 MarkdownContent 保持一致）
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .trim();
};

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isScrolling, setIsScrolling] = useState<boolean>(false); // 标记是否正在程序化滚动
  const [targetId, setTargetId] = useState<string>(''); // 记录目标ID
  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false); // 标记用户是否正在手动滚动

  useEffect(() => {
    // 解析 HTML 内容，提取标题
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    const items: TocItem[] = [];
    const usedIds = new Set<string>(); // 用于跟踪已使用的 ID
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
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
      
      items.push({
        id,
        text,
        level
      });
    });
    
    setTocItems(items);
  }, [content]);

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    
    // 检测当前位置并更新高亮
    const updateActiveId = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let currentId = '';
      
      // 找到当前视口中最靠近顶部的标题
      let minDistance = Infinity;
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);
        
        if (rect.top <= 150 && distance < minDistance) {
          minDistance = distance;
          currentId = heading.id;
        }
      });
      
      // 如果没有找到合适的标题，使用第一个可见的标题
      if (!currentId) {
        headings.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight && !currentId) {
            currentId = heading.id;
          }
        });
      }
      
      setActiveId(currentId);
    };

    // 监听滚动
    const handleScroll = () => {
      // 如果正在程序化滚动，保持目标高亮不变
      if (isScrolling && targetId) {
        return;
      }
      
      // 如果正在程序化滚动，跳过
      if (isScrolling) return;
      
      // 标记用户正在滚动
      setIsUserScrolling(true);
      
      // 清除之前的定时器
      clearTimeout(scrollTimer);
      
      // 设置新的定时器，滚动停止后更新高亮
      scrollTimer = setTimeout(() => {
        setIsUserScrolling(false);
        updateActiveId(); // 滚动停止后一次性更新高亮
      }, 150); // 150ms 后认为滚动停止
    };

    window.addEventListener('scroll', handleScroll);
    updateActiveId(); // 初始化
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [tocItems, isScrolling, targetId]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 立即更新活跃状态和目标ID
      setActiveId(id);
      setTargetId(id);
      
      // 设置滚动状态，禁用滚动监听
      setIsScrolling(true);
      
      const offsetTop = element.offsetTop - 80; // 考虑固定头部的高度
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // 使用更长的延迟确保滚动完全完成
      setTimeout(() => {
        setIsScrolling(false);
        setTargetId('');
      }, 1500); // 增加到1.5秒
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        目录
      </h3>
      
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={`
              block w-full text-left text-sm py-1 px-2 rounded transition-colors duration-200
              ${item.level === 1 ? 'font-medium' : ''}
              ${item.level === 2 ? 'ml-2' : ''}
              ${item.level === 3 ? 'ml-4' : ''}
              ${item.level === 4 ? 'ml-6' : ''}
              ${item.level === 5 ? 'ml-8' : ''}
              ${item.level === 6 ? 'ml-10' : ''}
              ${activeId === item.id 
                ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-600 pl-2' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
            title={item.text}
          >
            <span className="truncate block">
              {item.text}
            </span>
          </button>
        ))}
      </nav>
      
      {/* 进度指示器 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>点击标题快速跳转</span>
        </div>
      </div>
    </div>
  );
}