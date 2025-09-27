import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EssayTypeIcon from '@/components/essays/EssayTypeIcon';
import InfiniteScroll from '@/components/InfiniteScroll';
import Link from 'next/link';
import { getEssaysByCategory, essayTypes, getAllEssayCategories } from '@/lib/essays';
import { notFound } from 'next/navigation';

interface EssayCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const categories = getAllEssayCategories();
  return categories.map((category) => ({
    category: category.id,
  }));
}

export default async function EssayCategoryPage({ params }: EssayCategoryPageProps) {
  const { category } = await params;
  const categoryEssays = getEssaysByCategory(category);
  const categoryInfo = essayTypes.find(type => type.id === category);
  
  if (!categoryInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 面包屑导航 */}
        <div className="mb-6">
          <Link
            href="/essays"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回随笔
          </Link>
        </div>

        {/* 分类头部 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <EssayTypeIcon type={categoryInfo.id} className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{categoryInfo.name}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {categoryInfo.description}
          </p>
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${categoryInfo.color}`}>
            共 {categoryEssays.length} 篇文章
          </div>
        </div>

        {/* 文章列表 */}
        {categoryEssays.length > 0 ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">全部文章</h2>
              <p className="text-gray-600 mt-2">
                滚动到底部自动加载更多内容
              </p>
            </div>
            
            <InfiniteScroll
              items={categoryEssays}
              itemsPerPage={4}
              type="essay"
              categoryInfo={{
                id: categoryInfo.id,
                name: categoryInfo.name,
                color: categoryInfo.color
              }}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无{categoryInfo.name}</h3>
            <p className="text-gray-500 mb-6">
              这个分类下还没有发布任何文章，敬请期待更多精彩内容！
            </p>
            <Link
              href="/essays"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              浏览其他随笔分类
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}