import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  tags?: string[];
  author?: string;
}

export function getSortedPostsData(): PostData[] {
  // 确保 posts 目录存在
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        id,
        title: matterResult.data.title || '无标题',
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
        tags: matterResult.data.tags || [],
        author: matterResult.data.author || '匿名',
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          id: fileName.replace(/\.md$/, ''),
        },
      };
    });
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    content: contentHtml,
    title: matterResult.data.title || '无标题',
    date: matterResult.data.date || new Date().toISOString(),
    excerpt: matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
    tags: matterResult.data.tags || [],
    author: matterResult.data.author || '匿名',
  };
}