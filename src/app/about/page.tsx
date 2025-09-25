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
              <p className="text-xl text-gray-600 mb-8">
                你好，我是 SinzoL，一个热爱挑战的程序员。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">我的爱好</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🏃‍♂️</span>
                    <h3 className="font-semibold text-blue-900">马拉松</h3>
                  </div>
                  <p className="text-blue-700">
                    享受在跑道上挥洒汗水的感觉，每一步都是对自己极限的挑战。长跑教会了我坚持和耐力，这些品质在编程中同样重要。
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🧩</span>
                    <h3 className="font-semibold text-green-900">数独</h3>
                  </div>
                  <p className="text-green-700">
                    热爱数独游戏中的逻辑推理和数字排列。这种对规律和逻辑的敏感度，让我在算法设计和问题解决上有着独特的思维方式。
                  </p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">比赛经历</h2>
              <div className="bg-purple-50 p-6 rounded-lg mb-8">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🔐</span>
                  <h3 className="font-semibold text-purple-900">网络安全竞赛</h3>
                </div>
                <p className="text-purple-700">
                  作为密码手参与过多次网络安全比赛，专注于密码学算法的分析与破解。
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">联系我</h2>
              <p className="text-gray-600 mb-4">
                如果你也喜欢跑步、数独，或者对网络安全感兴趣，欢迎和我交流！
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:3013749951@qq.com"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  📧 邮箱
                </a>
                <a
                  href="https://github.com/SinzoL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  💻 GitHub
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