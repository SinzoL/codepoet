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
}

export function getSortedEssaysData(): Essay[] {
  // 检查目录是否存在
  if (!fs.existsSync(essaysDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(essaysDirectory);
  const allEssaysData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(essaysDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // 计算阅读时间（基于字数，平均每分钟200字）
      const wordCount = matterResult.content.length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        id,
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

  return allEssaysData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getEssayData(id: string): Promise<Essay | null> {
  try {
    const fullPath = path.join(essaysDirectory, `${id}.md`);
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
  } catch (error) {
    return null;
  }
}

export function getEssaysByType(type: Essay['type']): Essay[] {
  const allEssays = getSortedEssaysData();
  return allEssays.filter(essay => essay.type === type);
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