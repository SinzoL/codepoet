import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

// SVG 图标组件
const RunningIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </svg>
);

const SudokuIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm0-4H7v-2h2v2zm0-4H7V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
  </svg>
);

const BookIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
  </svg>
);

const ThinkingIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
  </svg>
);

const AuthorIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:px-8">
            {/* 头像和标题区域 */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image 
                    src="/avatar.png" 
                    alt="SinzoL 的头像" 
                    width={100}
                    height={100}
                    className="w-30 h-30 rounded-full object-cover shadow-lg border-4 border-gray-100"
                    priority
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  关于我
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  你好，我是 SinzoL，来自哈尔滨工业大学（深圳）。
                </p>
                
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">我的爱好</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="text-blue-600 mr-3">
                      <RunningIcon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-blue-900">马拉松</h4>
                  </div>
                  <p className="text-blue-700">
                    享受在跑道上挥洒汗水的感觉，每一步都是对自己极限的挑战。长跑教会了我坚持和耐力，这些品质在编程中同样重要。
                  </p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="text-green-600 mr-3">
                      <SudokuIcon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-green-900">数独</h4>
                  </div>
                  <p className="text-green-700">
                    热爱数独游戏中的逻辑推理和数字排列。这种对规律和逻辑的敏感度，让我在算法设计和问题解决上有着独特的思维方式。
                  </p>
                </div>

                <div className="bg-amber-50 p-6 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="text-amber-600 mr-3">
                      <BookIcon className="w-8 h-8" />
                    </div>
                    <h4 className="font-semibold text-amber-900">阅读</h4>
                  </div>
                  <p className="text-amber-700">
                    热爱文学作品，特别是经典小说。阅读让我在代码之外找到另一个精神世界，文字的力量总能给我带来新的思考和灵感。
                  </p>
                </div>
              </div>

              {/* 阅读展示区域 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-6 text-center">我的文学世界</h3>
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="lg:w-1/3 flex justify-center">
                    <div className="relative">
                      <Image 
                        src="/Henryk_sienkiewicz.png" 
                        alt="Henryk Sienkiewicz - 诺贝尔文学奖得主" 
                        width={192}
                        height={256}
                        className="w-48 h-64 object-cover rounded-lg shadow-lg border-4 border-white"
                        priority
                      />
                    </div>
                  </div>
                  <div className="lg:w-2/3 space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="text-amber-600 mr-3">
                          <AuthorIcon className="w-8 h-8" />
                        </div>
                        <h4 className="font-semibold text-gray-900">最喜欢的作家</h4>
                      </div>
                      <p className="text-gray-700">
                        <strong>亨利克·显克维支 (Henryk Sienkiewicz)</strong> - 1905年诺贝尔文学奖得主，波兰著名小说家。
                        他的作品《你往何处去》深深震撼了我，展现了人性在历史洪流中的挣扎与光辉。
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="text-amber-600 mr-3">
                          <ThinkingIcon className="w-8 h-8" />
                        </div>
                        <h4 className="font-semibold text-gray-900">阅读感悟</h4>
                      </div>
                      <p className="text-gray-700">
                        &ldquo;文学是人类精神的镜子，它不仅记录历史，更塑造未来。&rdquo; 
                        每一本好书都是一次心灵的旅行，让我在技术世界之外保持对人文的思考。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">历史小说</span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">经典文学</span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">哲学思辨</span>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">人文关怀</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">找到我</h2>
              <p className="text-gray-600 mb-6">
                如果你也喜欢跑步、数独、阅读，欢迎和我交流！
              </p>
              
              {/* 美化的联系方式按钮 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                {/* 邮箱按钮 */}
                <a
                  href="mailto:3013749951@qq.com"
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-25 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">邮箱联系</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-300 to-teal-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </a>

                {/* GitHub 按钮 */}
                <a
                  href="https://github.com/SinzoL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">GitHub</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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