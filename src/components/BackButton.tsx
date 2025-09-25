'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BackButtonProps {
  postCategory?: string;
}

export default function BackButton({ postCategory }: BackButtonProps) {
  const router = useRouter();
  const [backUrl, setBackUrl] = useState('/');
  const [backText, setBackText] = useState('返回');

  useEffect(() => {
    // 获取 referrer 信息
    const referrer = document.referrer;
    
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const pathname = referrerUrl.pathname;
      
      // 如果来自分类页面
      if (pathname === '/categories') {
        setBackUrl('/categories');
        setBackText('返回分类列表');
      }
      // 如果来自具体分类页面
      else if (pathname.startsWith('/categories/') && postCategory) {
        const categoryId = pathname.split('/categories/')[1];
        if (categoryId === postCategory) {
          setBackUrl(`/categories/${categoryId}`);
          setBackText(`返回${getCategoryName(categoryId)}分类`);
        } else {
          setBackUrl('/categories');
          setBackText('返回分类列表');
        }
      }
      // 如果来自首页
      else if (pathname === '/') {
        setBackUrl('/');
        setBackText('返回');
      }
      // 其他情况，检查是否有分类信息
      else if (postCategory) {
        setBackUrl(`/categories/${postCategory}`);
        setBackText(`返回${getCategoryName(postCategory)}分类`);
      }
    } else if (postCategory) {
      // 没有 referrer 但有分类信息
      setBackUrl(`/categories/${postCategory}`);
      setBackText(`返回${getCategoryName(postCategory)}分类`);
    }
  }, [postCategory]);

  const getCategoryName = (categoryId: string): string => {
    const categoryNames: { [key: string]: string } = {
      'website': '建站',
      'frontend': '前端',
      'security': '安全',
      'backend': '后端',
      'fun': '趣事',
      'ctf': 'CTF'
    };
    return categoryNames[categoryId] || '未知';
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 尝试使用浏览器的后退功能
    if (window.history.length > 1) {
      router.back();
    } else {
      // 如果没有历史记录，则跳转到指定页面
      router.push(backUrl);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backText}
      </button>
    </div>
  );
}