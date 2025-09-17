import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              我的博客
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              关于
            </Link>
          </nav>
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}