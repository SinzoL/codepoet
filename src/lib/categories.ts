export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'website',
    name: '建站',
    description: '网站建设、部署、优化相关技术分享',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'frontend',
    name: '前端',
    description: 'React、Vue、JavaScript等前端技术',
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'security',
    name: '安全',
    description: '网络安全、漏洞分析、安全防护',
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'backend',
    name: '后端',
    description: '服务器开发、数据库、API设计',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'fun',
    name: '趣事',
    description: '编程路上的有趣经历和思考',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'ctf',
    name: 'CTF',
    description: 'CTF竞赛、题目解析、技巧分享',
    color: 'bg-indigo-100 text-indigo-800'
  }
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  return categories.find(category => category.name === name);
}