import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const essaysDirectory = path.join(process.cwd(), 'posts/essays');

export interface Essay {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags?: string[];
  type: 'reading' | 'thoughts' | 'life';
  readingTime?: number;
  category: string;
}

export interface EssayCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  count: number;
}

export const essayTypes = [
  {
    id: 'reading' as const,
    name: '读书笔记',
    description: '阅读心得与思考',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'thoughts' as const,
    name: '随想',
    description: '生活感悟与思考',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'life' as const,
    name: '生活',
    description: '日常生活记录、游记见闻与感悟',
    color: 'bg-green-100 text-green-800'
  }
];

export function getAllEssayCategories(): EssayCategory[] {
  const categories: EssayCategory[] = [];
  
  essayTypes.forEach(type => {
    const categoryPath = path.join(essaysDirectory, type.id);
    let count = 0;
    
    if (fs.existsSync(categoryPath)) {
      const files = fs.readdirSync(categoryPath);
      count = files.filter(name => name.endsWith('.md')).length;
    }
    
    categories.push({
      id: type.id,
      name: type.name,
      description: type.description,
      color: type.color,
      count
    });
  });
  
  return categories;
}

export function getSortedEssaysData(): Essay[] {
  const allEssaysData: Essay[] = [];
  
  // 遍历所有分类目录
  essayTypes.forEach(type => {
    const categoryPath = path.join(essaysDirectory, type.id);
    
    if (fs.existsSync(categoryPath)) {
      const fileNames = fs.readdirSync(categoryPath);
      const categoryEssays = fileNames
        .filter(name => name.endsWith('.md'))
        .map((fileName) => {
          const id = fileName.replace(/\.md$/, '');
          const fullPath = path.join(categoryPath, fileName);
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const matterResult = matter(fileContents);

          // 计算阅读时间（基于字数，平均每分钟200字）
          const wordCount = matterResult.content.length;
          const readingTime = Math.ceil(wordCount / 200);

          return {
            id: `${type.id}/${id}`,
            category: type.id,
            content: matterResult.content,
            readingTime,
            ...(matterResult.data as {
              title: string;
              date: string;
              excerpt: string;
              tags?: string[];
              type: 'reading' | 'thoughts' | 'life';
            }),
          };
        });
      
      allEssaysData.push(...categoryEssays);
    }
  });

  // 兼容旧的直接在 essays 目录下的文件
  const rootFiles = fs.existsSync(essaysDirectory) ? fs.readdirSync(essaysDirectory) : [];
  const rootEssays = rootFiles
    .filter(name => name.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(essaysDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const wordCount = matterResult.content.length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        id,
        category: 'general',
        content: matterResult.content,
        readingTime,
        ...(matterResult.data as {
          title: string;
          date: string;
          excerpt: string;
          tags?: string[];
          type: 'reading' | 'thoughts' | 'life';
        }),
      };
    });

  allEssaysData.push(...rootEssays);

  return allEssaysData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getEssaysByCategory(category: string): Essay[] {
  const categoryPath = path.join(essaysDirectory, category);
  
  if (!fs.existsSync(categoryPath)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(categoryPath);
  const categoryEssays = fileNames
    .filter(name => name.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(categoryPath, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const wordCount = matterResult.content.length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        id: `${category}/${id}`,
        category,
        content: matterResult.content,
        readingTime,
        ...(matterResult.data as {
          title: string;
          date: string;
          excerpt: string;
          tags?: string[];
          type: 'reading' | 'thoughts' | 'life';
        }),
      };
    });

  return categoryEssays.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getEssayData(id: string): Promise<Essay | null> {
  try {
    // id 格式: category/filename 或 filename
    const [category, filename] = id.includes('/') ? id.split('/') : ['', id];
    
    let fullPath: string;
    let actualCategory = category;
    
    if (category && essayTypes.find(type => type.id === category)) {
      // 新的分类目录结构
      fullPath = path.join(essaysDirectory, category, `${filename}.md`);
    } else {
      // 兼容旧的直接在 essays 目录下的文件
      fullPath = path.join(essaysDirectory, `${id}.md`);
      actualCategory = 'general';
    }
    
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // 使用 remark 将 markdown 转换为 HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    const wordCount = matterResult.content.length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      id,
      category: actualCategory,
      content: contentHtml,
      readingTime,
      ...(matterResult.data as {
        title: string;
        date: string;
        excerpt: string;
        tags?: string[];
        type: 'reading' | 'thoughts' | 'life';
      }),
    };
  } catch {
    return null;
  }
}

export function getEssaysByType(type: Essay['type']): Essay[] {
  const allEssays = getSortedEssaysData();
  return allEssays.filter(essay => essay.type === type);
}