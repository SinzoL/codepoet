'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostData } from '@/lib/posts';
import { Essay } from '@/lib/essays';
import Link from 'next/link';
import TechCategoryIcon from '@/components/tech/TechCategoryIcon';
import EssayTypeIcon from '@/components/essays/EssayTypeIcon';

interface InfiniteScrollProps {
  items: (PostData | Essay)[];
  itemsPerPage?: number;
  type: 'tech' | 'essay';
  categoryInfo?: {
    id: string;
    name: string;
    color: string;
  };
}

export default function InfiniteScroll({ 
  items, 
  itemsPerPage = 4, 
  type,
  categoryInfo 
}: InfiniteScrollProps) {
  const [displayedItems, setDisplayedItems] = useState<(PostData | Essay)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 初始化显示前4篇文章
  useEffect(() => {
    const initialItems = items.slice(0, itemsPerPage);
    setDisplayedItems(initialItems);
    setHasMore(items.length > itemsPerPage);
  }, [items, itemsPerPage]);

  // 加载更多文章
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // 模拟网络延迟
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedItems(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < items.length);
      } else {
        setHasMore(false);
      }
      
      setLoading(false);
    }, 500);
  }, [currentPage, itemsPerPage, items, loading, hasMore]);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      
      // 当滚动到距离底部200px时开始加载
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, loading, hasMore]);

  return (
    <div>
      {/* 文章列表 */}
      <div className="space-y-8">
        {displayedItems.map((item, index) => (
          <Link 
            key={`${item.id}-${index}`} 
            href={type === 'tech' ? `/posts/${item.id}` : `/essays/${item.id}`} 
            className="group block"
          >
            <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <div className="mr-3">
                  {type === 'tech' ? (
                    <TechCategoryIcon techCategoryId={categoryInfo?.id || ''} className="w-6 h-6" />
                  ) : (
                    <EssayTypeIcon type={(item as Essay).type} className="w-6 h-6" />
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo?.color}`}>
                  {categoryInfo?.name}
                </span>
                <span className="ml-auto text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                {item.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                {item.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  {item.readingTime && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      约 {item.readingTime} 分钟
                    </span>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{item.tags.slice(0, 2).join(', ')}</span>
                      {item.tags.length > 2 && <span>...</span>}
                    </div>
                  )}
                </div>
                <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                  阅读全文 →
                </span>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-blue-50 transition ease-in-out duration-150">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            正在加载更多文章...
          </div>
        </div>
      )}

      {/* 没有更多内容 */}
      {!hasMore && displayedItems.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已显示全部 {items.length} 篇文章
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="text-center py-4 text-sm text-gray-500">
        显示 {displayedItems.length} / {items.length} 篇文章
      </div>
    </div>
  );
}