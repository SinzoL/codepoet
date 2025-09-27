import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCachedPosts, getCachedTechCategories } from '@/lib/cache';
import TechCategoryIcon from '@/components/tech/TechCategoryIcon';
import OptimizedImage from '@/components/OptimizedImage';
import { PostData } from '@/lib/posts';
import { TechCategory } from '@/lib/tech';

// 类型别名，方便使用
type Post = PostData;

// 简单的 SVG 图标组件
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Tag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5l7 7-7 7-7-7V3z" />
  </svg>
);

// 生成静态参数
export async function generateStaticParams() {
  const categories = await getCachedTechCategories() as TechCategory[];
  return categories.map((category) => ({
    category: category.id,
  }));
}

// 生成动态 metadata
export async function generateMetadata({ 
  params 
}: { 
  params: { category: string } 
}): Promise<Metadata> {
  const categories = await getCachedTechCategories() as TechCategory[];
  const category = categories.find((c: TechCategory) => c.id === params.category);
  
  if (!category) {
    return {
      title: '分类未找到',
    };
  }

  const posts = await getCachedPosts() as Post[];
  const categoryPosts = posts.filter((post: Post) => post.techCategory === params.category);

  return {
    title: `${category.name} - 技术文章`,
    description: `${category.description} - 共 ${categoryPosts.length} 篇文章`,
    keywords: [category.name, '技术文章', '编程', '开发'],
    openGraph: {
      title: `${category.name} - CodePoet`,
      description: category.description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} - CodePoet`,
      description: category.description,
    },
  };
}

// 文章卡片组件
function PostCard({ post }: { post: Post }) {
  return (
    <article className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* 文章封面图片 */}
      {post.coverImage && (
        <div className="aspect-video overflow-hidden">
          <OptimizedImage
            src={post.coverImage}
            alt={post.title}
            width={400}
            height={225}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* 文章标题 */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          <Link href={`/tech/${post.techCategory}/${post.id}`}>
            {post.title}
          </Link>
        </h2>
        
        {/* 文章摘要 */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('zh-CN')}
              </time>
            </div>
            
            {post.readingTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime}</span>
              </div>
            )}
          </div>
          
          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag className="w-4 h-4" />
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {post.tags[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// 加载骨架屏
function PostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 文章列表组件
async function PostsList({ categoryId }: { categoryId: string }) {
  const posts = await getCachedPosts() as Post[];
  const categoryPosts = posts
    .filter((post: Post) => post.techCategory === categoryId)
    .sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (categoryPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Tag className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">暂无文章</h3>
        <p className="text-gray-600">这个分类下还没有发布文章，敬请期待！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoryPosts.map((post: Post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 统计信息组件
async function PostsStats({ categoryId }: { categoryId: string }) {
  const posts = await getCachedPosts() as Post[];
  const categoryPosts = posts.filter((post: Post) => post.techCategory === categoryId);
  
  const totalPosts = categoryPosts.length;
  const totalReadingTime = categoryPosts.reduce((total: number, post: Post) => {
    const time = post.readingTime?.match(/\d+/)?.[0];
    return total + (time ? parseInt(time) : 0);
  }, 0);

  return (
    <div className="flex items-center space-x-6 text-sm text-gray-500">
      <div className="flex items-center space-x-1">
        <Tag className="w-4 h-4" />
        <span>{totalPosts} 篇文章</span>
      </div>
      {totalReadingTime > 0 && (
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>约 {totalReadingTime} 分钟阅读</span>
        </div>
      )}
    </div>
  );
}

// 主页面组件
export default async function TechCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const categories = await getCachedTechCategories() as TechCategory[];
  const category = categories.find((c: TechCategory) => c.id === params.category);

  if (!category) {
    notFound();
  }

  // 预加载相关分类页面
  const relatedCategories = categories
    .filter((c: TechCategory) => c.id !== params.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 预加载提示 */}
      {relatedCategories.map((cat: TechCategory) => (
        <link
          key={cat.id}
          rel="prefetch"
          href={`/tech/${cat.id}`}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            href="/tech"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回技术分类</span>
          </Link>
        </div>

        {/* 分类头部 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <TechCategoryIcon techCategoryId={category.id} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {category.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {category.description}
              </p>
            </div>
          </div>

          {/* 统计信息 */}
          <Suspense fallback={<div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />}>
            <PostsStats categoryId={params.category} />
          </Suspense>
        </div>

        {/* 文章列表 */}
        <Suspense fallback={<PostsSkeleton />}>
          <PostsList categoryId={params.category} />
        </Suspense>
      </div>
    </div>
  );
}