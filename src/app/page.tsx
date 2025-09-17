import { getSortedPostsData } from '@/lib/posts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            CodePoet
            <span className="block text-2xl md:text-3xl font-normal text-gray-600 dark:text-gray-300 mt-2">
              代码诗人
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            在这个数字时代，我用代码编织诗意，用算法描绘梦想。<br />
            这里是技术与艺术的交汇点，是逻辑与创意的诗意空间。<br />
            让我们一起在 0 和 1 的世界里，寻找属于程序员的浪漫。
          </p>
        </div>

        {/* Posts Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">最新文章</h2>
          
          {allPostsData.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
              {allPostsData.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">诗篇正在酝酿中...</h3>
              <p className="text-gray-500 dark:text-gray-400">
                每一篇技术文章都是一首代码诗歌，正在用心雕琢中。<br/>
                在 <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">posts/</code> 目录下添加 Markdown 文件来发布你的第一首诗篇。
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
