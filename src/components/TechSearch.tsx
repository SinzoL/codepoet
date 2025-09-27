'use client';

import { useState, useEffect, useRef } from 'react';
import { PostData } from '@/lib/posts';
import { searchPosts, highlightKeywords, getSearchSuggestions, SearchResult } from '@/lib/searchUtils';
import Link from 'next/link';

interface TechSearchProps {
  posts: PostData[];
  categoryId?: string; // 如果提供，则只在该分类中搜索
  placeholder?: string;
  className?: string;
}

// 搜索图标组件
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// 清除图标组件
const ClearIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// 标签图标组件
const TagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5l7 7-7 7-7-7V3z" />
  </svg>
);

// 日历图标组件
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
  </svg>
);

export default function TechSearch({ posts, categoryId, placeholder = "搜索技术文章...", className = "" }: TechSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 过滤文章（如果指定了分类）
  const filteredPosts = categoryId 
    ? posts.filter(post => post.techCategory === categoryId)
    : posts;

  // 搜索处理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        const searchResults = searchPosts(filteredPosts, query);
        const searchSuggestions = getSearchSuggestions(filteredPosts, query);
        
        setResults(searchResults);
        setSuggestions(searchSuggestions);
        setIsOpen(true);
        setIsLoading(false);
      } else {
        setResults([]);
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
      }
    }, 300); // 防抖延迟

    return () => clearTimeout(timeoutId);
  }, [query, filteredPosts]);

  // 点击外部关闭搜索结果
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 选择建议
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ClearIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">搜索中...</p>
            </div>
          ) : (
            <>
              {/* 搜索建议 */}
              {suggestions.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">搜索建议</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 搜索结果 */}
              {results.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 text-left">
                    找到 {results.length} 篇相关文章
                  </div>
                  {results.slice(0, 8).map((result) => (
                    <Link
                      key={result.id}
                      href={`/posts/${result.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-start justify-between text-left">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 text-left"
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(result.title, result.matchedKeywords)
                            }}
                          />
                          <p 
                            className="text-xs text-gray-600 line-clamp-2 mb-2 text-left"
                            dangerouslySetInnerHTML={{
                              __html: highlightKeywords(result.excerpt, result.matchedKeywords)
                            }}
                          />
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{new Date(result.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                            {result.tags && result.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <TagIcon className="w-3 h-3" />
                                <span>{result.tags[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <div className="text-xs text-blue-600 font-medium">
                            匹配度: {Math.round((result.score / Math.max(...results.map(r => r.score))) * 100)}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {results.length > 8 && (
                    <div className="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50">
                      还有 {results.length - 8} 篇相关文章...
                    </div>
                  )}
                </div>
              ) : query.trim() && !isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <SearchIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>未找到相关文章</p>
                  <p className="text-xs mt-1">尝试使用不同的关键词</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}