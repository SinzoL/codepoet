import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              关于我
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-6">
                欢迎来到我的个人博客！我是一名热爱技术和分享的开发者。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">我的故事</h2>
              <p className="text-gray-700 mb-6">
                在这个快速发展的数字时代，我相信知识分享的力量。通过这个博客，我希望能够：
              </p>
              
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>分享我在技术领域的学习心得和实践经验</li>
                <li>记录生活中的思考和感悟</li>
                <li>与志同道合的朋友们交流想法</li>
                <li>持续学习和成长</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">技术栈</h2>
              <p className="text-gray-700 mb-4">
                我主要专注于以下技术领域：
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">前端开发</h3>
                  <p className="text-sm text-blue-700">React, Next.js, TypeScript</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">后端开发</h3>
                  <p className="text-sm text-green-700">Node.js, Python, Go</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">数据库</h3>
                  <p className="text-sm text-purple-700">PostgreSQL, MongoDB</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">联系我</h2>
              <p className="text-gray-700 mb-6">
                如果你对我的文章有任何想法，或者想要交流技术话题，欢迎通过以下方式联系我：
              </p>
              
              <div className="flex space-x-4">
                <a
                  href="mailto:your-email@example.com"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-white bg-white hover:bg-gray-50 transition-colors"
                >
                  发送邮件
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}