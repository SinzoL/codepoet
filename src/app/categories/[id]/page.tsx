import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import CategoryIcon from '@/components/CategoryIcon';
import Link from 'next/link';
import { categories, getCategoryById } from '@/lib/categories';
import { getSortedPostsData } from '@/lib/posts';

interface CategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    id: category.id,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const category = getCategoryById(id);
  
  if (!category) {
    notFound();
  }

  const allPosts = getSortedPostsData();
  const categoryPosts = allPosts.filter(post => post.category === category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <Link
            href="/categories"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回分类
          </Link>
        </div>

        {/* 分类头部 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mr-4">
              <CategoryIcon categoryId={category.id} className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${category.color} mt-2`}>
                {categoryPosts.length} 篇文章
              </span>
            </div>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed">
            {category.description}
          </p>
        </div>

        {/* 文章列表 */}
        {categoryPosts.length > 0 ? (
          <div className="space-y-8">
            {categoryPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
                <CategoryIcon categoryId={category.id} className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
            <p className="text-gray-500 mb-6">
              这个分类下还没有文章，敬请期待更多精彩内容！
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              浏览其他分类
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}