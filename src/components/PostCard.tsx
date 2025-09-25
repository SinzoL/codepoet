import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PostData } from '@/lib/posts';
import { getCategoryById } from '@/lib/categories';

interface PostCardProps {
  post: PostData;
}

export default function PostCard({ post }: PostCardProps) {
  const category = getCategoryById(post.category || 'stories');
  
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <time dateTime={post.date}>
              {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
            </time>
            <span className="mx-2">•</span>
            <span>{post.author}</span>
          </div>
          {category && (
            <Link 
              href={`/categories/${category.id}`}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color} hover:opacity-80 transition-opacity`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Link>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          <Link 
            href={`/posts/${post.id}`} 
            className="block hover:text-blue-600 transition-colors overflow-hidden text-ellipsis whitespace-nowrap"
            title={post.title}
          >
            {post.title}
          </Link>
        </h2>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          阅读更多
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}