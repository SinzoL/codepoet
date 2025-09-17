import { getAllPostIds, getPostData } from '@/lib/posts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface PostPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map((path) => ({
    id: path.params.id,
  }));
}

export default async function Post({ params }: PostPageProps) {
  const { id } = await params;
  const postData = await getPostData(id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Article Header */}
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {postData.title}
            </h1>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
              <time dateTime={postData.date}>
                {format(new Date(postData.date), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
              <span className="mx-2">•</span>
              <span>{postData.author}</span>
            </div>
            
            {postData.tags && postData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {postData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Article Content */}
          <div className="px-6 pb-8 sm:px-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-pre:text-gray-200"
              dangerouslySetInnerHTML={{ __html: postData.content || '' }}
            />
          </div>
        </article>
        
        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            查看更多文章
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}