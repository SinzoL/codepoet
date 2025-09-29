'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // 判断当前路径是否匹配导航项
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // 获取桌面端导航项样式
  const getNavLinkClass = (path: string) => {
    const baseClass = "text-gray-700 hover:text-blue-600 transition-colors";
    const activeClass = "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1";
    return isActive(path) ? `${baseClass} ${activeClass}` : baseClass;
  };

  // 获取移动端导航项样式
  const getMobileNavLinkClass = (path: string) => {
    const baseClass = "block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors rounded-md";
    const activeClass = "text-blue-600 bg-blue-50 font-semibold";
    return isActive(path) ? `${baseClass} ${activeClass}` : baseClass;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-lg border-b border-white/10 shadow-lg backdrop-saturate-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors" onClick={closeMenu}>
              CodePoet
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={getNavLinkClass('/')}>
              首页
            </Link>
            <Link href="/tech" className={getNavLinkClass('/tech')}>
              技术
            </Link>
            <Link href="/essays" className={getNavLinkClass('/essays')}>
              随笔
            </Link>
            <Link href="/about" className={getNavLinkClass('/about')}>
              关于
            </Link>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-white/50 backdrop-blur-lg">
            <nav className="py-4 space-y-2">
              <Link 
                href="/" 
                className={getMobileNavLinkClass('/')}
                onClick={closeMenu}
              >
                首页
              </Link>
              <Link 
                href="/tech" 
                className={getMobileNavLinkClass('/tech')}
                onClick={closeMenu}
              >
                技术
              </Link>
              <Link 
                href="/essays" 
                className={getMobileNavLinkClass('/essays')}
                onClick={closeMenu}
              >
                随笔
              </Link>
              <Link 
                href="/about" 
                className={getMobileNavLinkClass('/about')}
                onClick={closeMenu}
              >
                关于
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}