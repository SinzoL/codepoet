import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import EssayTypeIcon from '@/components/essays/EssayTypeIcon';
import { getSortedEssaysData, essayTypes } from '@/lib/essays';

export default function Essays() {
  const allEssays = getSortedEssaysData();
  
  // 统计每个类型的随笔数量
  const typeStats = essayTypes.map(type => ({
    ...type,
    count: allEssays.filter(essay => essay.type === type.id).length
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">随笔</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            记录生活中的点点滴滴，分享读书心得与人生感悟
          </p>
        </div>

        {/* 随笔类型 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {typeStats.map((type) => (
            <Link
              key={type.id}
              href={`/essays/${type.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 text-center cursor-pointer transform hover:-translate-y-1">
                <div className="mb-3 flex justify-center">
                  <EssayTypeIcon type={type.id} className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {type.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {type.description}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${type.color}`}>
                  {type.count} 篇
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* 最新随笔 */}
        {allEssays.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">最新随笔</h2>
            <div className="space-y-8">
              {allEssays.map((essay) => {
                const type = essayTypes.find(t => t.id === essay.type);
                return (
                  <Link key={essay.id} href={`/essays/${essay.id}`} className="group block">
                    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 cursor-pointer transform hover:-translate-y-1">
                      <div className="flex items-center mb-3">
                        <div className="mr-3">
                          <EssayTypeIcon type={essay.type} className="w-6 h-6" />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${type?.color}`}>
                          {type?.name}
                        </span>
                        <span className="ml-auto text-sm text-gray-500">
                          {new Date(essay.date).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                        {essay.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {essay.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {essay.readingTime && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              约 {essay.readingTime} 分钟
                            </span>
                          )}
                          {essay.tags && essay.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>{essay.tags.slice(0, 2).join(', ')}</span>
                              {essay.tags.length > 2 && <span>...</span>}
                            </div>
                          )}
                        </div>
                        <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                          阅读全文 →
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无随笔</h3>
            <p className="text-gray-500 mb-6">
              还没有发布任何随笔，敬请期待更多精彩内容！
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}