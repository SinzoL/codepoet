import { getAllPostIds, getPostData } from '@/lib/posts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import Link from 'next/link';

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Article Header */}
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {postData.title}
            </h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-6">
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
                    className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Article Content */}
          <div className="px-6 pb-8 sm:px-8">
            <MarkdownContent content={postData.content || ''} />
          </div>
        </div>
        
        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            查看更多文章
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}