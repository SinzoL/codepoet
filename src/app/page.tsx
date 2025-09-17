import { getSortedPostsData } from '@/lib/posts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            欢迎来到我的博客
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            在这里分享我的技术见解、生活感悟和创意想法。让我们一起探索知识的海洋。
          </p>
        </div>

        {/* Posts Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">最新文章</h2>
          
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有文章</h3>
              <p className="text-gray-500">
                在 <code className="bg-gray-100 px-2 py-1 rounded text-sm">posts/</code> 目录下添加 Markdown 文件来创建你的第一篇文章。
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
