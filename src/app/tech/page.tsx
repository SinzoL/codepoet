import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TechCategoryIcon from '@/components/tech/TechCategoryIcon';
import TechSearch from '@/components/TechSearch';
import Link from 'next/link';
import { techCategories } from '@/lib/tech';
import { getSortedPostsData } from '@/lib/posts';

export default function TechCategories() {
  const allPosts = getSortedPostsData();
  
  // 统计每个技术分类的文章数量
  const techCategoryStats = techCategories.map(techCategory => ({
    ...techCategory,
    count: allPosts.filter(post => post.techCategory === techCategory.id).length
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">技术分类</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              探索不同领域的技术知识
            </p>
          </div>
          
          {/* 全局搜索框 */}
          <div className="max-w-2xl mx-auto">
            <TechSearch 
              posts={allPosts} 
              placeholder="搜索所有技术文章..."
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techCategoryStats.map((techCategory) => (
            <Link
              key={techCategory.id}
              href={`/tech/${techCategory.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 h-full">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mr-3">
                    <TechCategoryIcon techCategoryId={techCategory.id} className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {techCategory.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${techCategory.color}`}>
                      {techCategory.count} 篇文章
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {techCategory.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* 最新文章预览 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">最新文章</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts.slice(0, 6).map((post) => {
              const techCategory = techCategories.find(cat => cat.id === post.techCategory);
              return (
                <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 cursor-pointer transform hover:-translate-y-1 hover:bg-gray-50">
                    <div className="flex items-center mb-2">
                      {techCategory && (
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 mr-2 group-hover:bg-gray-200 transition-colors">
                          <TechCategoryIcon techCategoryId={techCategory.id} className="w-3 h-3 text-gray-600 group-hover:text-gray-700" />
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${techCategory?.color} group-hover:opacity-80 transition-opacity`}>
                        {techCategory?.name}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-700 text-sm line-clamp-2 transition-colors">
                      {post.excerpt}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      {new Date(post.date).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}