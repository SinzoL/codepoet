import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InfiniteScroll from '@/components/InfiniteScroll';
import TechSearch from '@/components/TechSearch';
import TechCategoryIcon from '@/components/tech/TechCategoryIcon';
import Link from 'next/link';
import { techCategories } from '@/lib/tech';
import { getSortedPostsData } from '@/lib/posts';

// 生成动态 metadata
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const techCategory = techCategories.find(cat => cat.id === category);
  
  if (!techCategory) {
    return {
      title: '分类不存在',
    };
  }

  return {
    title: `${techCategory.name} - 技术分类`,
    description: techCategory.description,
  };
}

// 生成静态路径
export async function generateStaticParams() {
  return techCategories.map((techCategory) => ({
    category: techCategory.id,
  }));
}

// 主页面组件
export default async function TechCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const techCategory = techCategories.find(cat => cat.id === category);
  
  if (!techCategory) {
    notFound();
  }

  const allPosts = getSortedPostsData();
  const posts = allPosts.filter(post => post.techCategory === category);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <Link
            href="/tech"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回技术分类
          </Link>
        </div>

        {/* 分类头部 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <TechCategoryIcon techCategoryId={techCategory.id} className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{techCategory.name}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {techCategory.description}
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${techCategory.color}`}>
            共 {posts.length} 篇文章
          </div>
          
          {/* 搜索框 */}
          <div className="mt-8 max-w-md mx-auto">
            <TechSearch 
              posts={allPosts} 
              categoryId={category}
              placeholder={`在 ${techCategory.name} 中搜索...`}
              className="w-full"
            />
          </div>
        </div>

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">全部文章</h2>
              <p className="text-gray-600 mt-2">
                滚动到底部自动加载更多内容
              </p>
            </div>
            
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">加载中...</p>
              </div>
            }>
              <InfiniteScroll 
                items={posts} 
                type="tech"
                categoryInfo={{
                  id: techCategory.id,
                  name: techCategory.name,
                  color: techCategory.color
                }}
              />
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无{techCategory.name}文章</h3>
            <p className="text-gray-500 mb-6">
              这个分类下还没有发布任何文章，敬请期待更多精彩内容！
            </p>
            <Link
              href="/tech"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              浏览其他技术分类
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}