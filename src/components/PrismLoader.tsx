'use client';

import { useEffect } from 'react';

export default function PrismLoader() {
  useEffect(() => {
    const loadPrism = async () => {
      // 动态导入 Prism 和主题
      const [{ default: Prism }] = await Promise.all([
        import('prismjs')
      ]);

      // 获取所有代码块
      const codeBlocks = document.querySelectorAll('pre code:not(.prism-highlighted)');

      // 批量处理代码块
      const loadPromises = Array.from(codeBlocks).map(async (codeBlock) => {
        const pre = codeBlock.parentElement as HTMLElement | null;
        if (!pre) return;

        const className = codeBlock.className || '';
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : 'text';

        // 按需加载语言组件
        if (language && language !== 'text') {
          try {
            await import(`prismjs/components/prism-${language}`);
          } catch {
            // 忽略不支持的语言
          }
        }

        // 应用样式
        pre.style.cssText = `
          background-color: #f6f8fa;
          border: 1px solid #e1e4e8;
          border-radius: 0.5rem;
          padding: 1rem;
          margin: 1.5rem 0;
          overflow: auto;
        `;

        (codeBlock as HTMLElement).style.cssText = `
          font-size: 0.875rem;
          line-height: 1.5;
          font-family: var(--font-geist-mono), Consolas, Monaco, monospace;
        `;

        try {
          Prism.highlightElement(codeBlock as Element);
          codeBlock.classList.add('prism-highlighted');
        } catch {
          // 容错处理
        }
      });

      await Promise.all(loadPromises);
    };

    // 使用 requestIdleCallback 在浏览器空闲时加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadPrism);
    } else {
      setTimeout(loadPrism, 100);
    }
  }, []);

  return null;
}