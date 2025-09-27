'use client';

import { useRouter } from 'next/navigation';

import { useEffect, useState } from 'react';

interface BackButtonProps {
  postTechCategory?: string;
}

export default function BackButton({ postTechCategory }: BackButtonProps) {
  const router = useRouter();
  const [backUrl, setBackUrl] = useState('/');
  const [backText, setBackText] = useState('返回');

  useEffect(() => {
    // 获取 referrer 信息
    const referrer = document.referrer;
    
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const pathname = referrerUrl.pathname;
      
      // 如果来自技术分类页面
      if (pathname === '/tech') {
        setBackUrl('/tech');
        setBackText('返回技术分类');
      }
      // 如果来自具体技术分类页面
      else if (pathname.startsWith('/tech/') && postTechCategory) {
        const techCategoryId = pathname.split('/tech/')[1];
        if (techCategoryId === postTechCategory) {
          setBackUrl(`/tech/${techCategoryId}`);
          setBackText(`返回${getTechCategoryName(techCategoryId)}分类`);
        } else {
          setBackUrl('/tech');
          setBackText('返回技术分类');
        }
      }
      // 如果来自首页
      else if (pathname === '/') {
        setBackUrl('/');
        setBackText('返回');
      }
      // 其他情况，检查是否有技术分类信息
      else if (postTechCategory) {
        setBackUrl(`/tech/${postTechCategory}`);
        setBackText(`返回${getTechCategoryName(postTechCategory)}分类`);
      }
    } else if (postTechCategory) {
      // 没有 referrer 但有技术分类信息
      setBackUrl(`/tech/${postTechCategory}`);
      setBackText(`返回${getTechCategoryName(postTechCategory)}分类`);
    }
  }, [postTechCategory]);

  const getTechCategoryName = (techCategoryId: string): string => {
    const techCategoryNames: { [key: string]: string } = {
      'website': '建站',
      'frontend': '前端',
      'security': '安全',
      'backend': '后端',
      'fun': '趣事',
      'ctf': 'CTF'
    };
    return techCategoryNames[techCategoryId] || '未知';
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