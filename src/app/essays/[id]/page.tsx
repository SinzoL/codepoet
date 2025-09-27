import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import EssayTypeIcon from '@/components/essays/EssayTypeIcon';
import Link from 'next/link';
import { getEssayData, getSortedEssaysData, essayTypes } from '@/lib/essays';

interface EssayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const essays = getSortedEssaysData();
  return essays.map((essay) => ({
    id: essay.id,
  }));
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { id } = await params;
  const essay = await getEssayData(id);
  
  if (!essay) {
    notFound();
  }

  const type = essayTypes.find(t => t.id === essay.type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="flex gap-8">
          {/* 主要内容 */}
          <div className="flex-1 min-w-0">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 文章头部 */}
              <div className="px-6 py-8 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    <EssayTypeIcon type={essay.type} className="w-8 h-8" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${type?.color}`}>
                    {type?.name}
                  </span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {essay.title}
                </h1>
                
                <div className="flex items-center text-gray-600 space-x-6">
                  <time className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(essay.date).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  
                  {essay.readingTime && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      约 {essay.readingTime} 分钟阅读
                    </span>
                  )}
                </div>

                {essay.tags && essay.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {essay.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 文章内容 */}
              <div className="px-6 py-8">
                <MarkdownContent content={essay.content} />
              </div>
            </article>

            {/* 返回按钮 */}
            <div className="mt-8">
              <Link
                href="/essays"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回随笔列表
              </Link>
            </div>
          </div>

          {/* 右侧目录导航 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents content={essay.content} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}