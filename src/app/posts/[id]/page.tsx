import { getAllPostIds, getPostData } from '@/lib/posts';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarkdownContent from '@/components/MarkdownContent';
import BackButton from '@/components/BackButton';
import TableOfContents from '@/components/TableOfContents';


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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 主要内容区域 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              {/* Article Header */}
              <div className="px-6 py-8 sm:px-8">
                <BackButton postTechCategory={postData.techCategory} />
                
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
          </div>
          
          {/* 右侧目录导航 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents content={postData.content || ''} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}