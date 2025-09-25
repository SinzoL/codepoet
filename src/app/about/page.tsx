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
              关于 CodePoet
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-6">
                你好，我是 SinzoL —— 一个在数字世界里寻找诗意的代码诗人。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">我的故事</h2>
              <p className="text-gray-700 mb-6">
                在键盘敲击的韵律中，在算法逻辑的美感里，我发现了编程的诗意。每一行代码都是一句诗，每一个函数都是一段旋律。通过这个博客，我希望能够：
              </p>
              
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>用诗意的语言分享技术的美妙与深邃</li>
                <li>记录代码世界里的灵感与思考</li>
                <li>与同样热爱编程艺术的朋友们交流心得</li>
                <li>在技术与人文的交汇点持续探索</li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">我的技术诗篇</h2>
              <p className="text-gray-700 mb-4">
                在这些技术的海洋中，我编织着属于自己的数字诗歌：
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">前端诗韵</h3>
                  <p className="text-sm text-blue-700">React, Next.js, TypeScript<br/>用组件编织用户体验的诗篇</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">后端韵律</h3>
                  <p className="text-sm text-green-700">Node.js, Python, Go<br/>在服务器端谱写逻辑的乐章</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">数据之美</h3>
                  <p className="text-sm text-purple-700">PostgreSQL, MongoDB<br/>让数据在结构中展现优雅</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">与诗人对话</h2>
              <p className="text-gray-700 mb-6">
                如果我的文字触动了你的心弦，或者你也想在代码的世界里寻找诗意，欢迎与我交流：
              </p>
              
              <div className="flex space-x-4">
                <a
                  href="mailto:3013749951@qq.com"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  发送邮件
                </a>
                <a
                  href="https://github.com/SinzoL"
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