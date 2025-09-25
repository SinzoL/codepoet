'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PostData } from '@/lib/posts';
import { getCategoryById } from '@/lib/categories';
import CategoryIcon from './CategoryIcon';

interface PostCardProps {
  post: PostData;
}

export default function PostCard({ post }: PostCardProps) {
  const category = getCategoryById(post.category || 'stories');
  
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1 hover:bg-gray-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
              <span className="mx-2">•</span>
              <span>{post.author}</span>
            </div>
            {category && (
              <div 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color} group-hover:opacity-80 transition-opacity`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/categories/${category.id}`;
                }}
              >
                <CategoryIcon categoryId={category.id} className="w-3 h-3 mr-1" />
                {category.name}
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap" title={post.title}>
            {post.title}
          </h2>
          
          <p className="text-gray-600 mb-4 line-clamp-3 group-hover:text-gray-800 transition-colors">
            {post.excerpt}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full group-hover:bg-blue-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}