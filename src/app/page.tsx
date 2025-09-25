import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              CodePoet
            </h1>
            <div className="text-2xl md:text-3xl text-gray-600 mb-12 font-light">
              代码与诗的交响
            </div>
            
            {/* 诗意描述 */}
            <div className="max-w-2xl mx-auto mb-16">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                在这个数字时代，我用代码编织诗意，用算法描绘梦想
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                这里是技术与艺术的交汇点，是逻辑与创意的诗意空间<br />
                让我们一起在 0 和 1 的世界里，寻找属于程序员的浪漫
              </p>
            </div>

            {/* 代码诗歌 */}
            <div className="bg-gray-900 text-green-400 p-8 rounded-lg font-mono text-sm md:text-base max-w-lg mx-auto mb-12 shadow-lg">
              <div className="text-left">
                <div className="text-gray-500">{`// 代码诗人的第一首诗`}</div>
                <div className="mt-2">
                  <span className="text-blue-400">function</span> <span className="text-yellow-400">createDream</span>() {'{'}
                </div>
                <div className="ml-4 mt-1">
                  <span className="text-purple-400">const</span> <span className="text-white">passion</span> = <span className="text-green-300">&apos;coding&apos;</span>;
                </div>
                <div className="ml-4">
                  <span className="text-purple-400">const</span> <span className="text-white">poetry</span> = <span className="text-green-300">&apos;life&apos;</span>;
                </div>
                <div className="ml-4 mt-1">
                  <span className="text-pink-400">return</span> <span className="text-white">passion</span> + <span className="text-white">poetry</span>;
                </div>
                <div className="mt-1">{'}'}</div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
