import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  tags?: string[];
  author?: string;
  category?: string;
}

// 递归读取所有子文件夹中的 markdown 文件
function getAllMarkdownFiles(dir: string, fileList: { filePath: string; id: string; category: string }[] = []): { filePath: string; id: string; category: string }[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归读取子文件夹
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      // 生成唯一的 id，包含文件夹路径信息
      const relativePath = path.relative(postsDirectory, filePath);
      const pathParts = relativePath.split(path.sep);
      const category = pathParts.length > 1 ? pathParts[0] : 'general';
      const fileName = pathParts[pathParts.length - 1];
      const id = relativePath.replace(/\.md$/, '').replace(/\//g, '-').replace(/\\/g, '-');
      
      fileList.push({ filePath, id, category });
    }
  });
  
  return fileList;
}

export function getSortedPostsData(): PostData[] {
  // 获取所有 markdown 文件
  const allFiles = getAllMarkdownFiles(postsDirectory);
  
  const allPostsData = allFiles.map(({ filePath, id, category }) => {
    try {
      // 读取 markdown 文件内容
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // 使用 gray-matter 解析文章元数据
      const matterResult = matter(fileContents);

      // 合并数据和 id
      return {
        id,
        title: matterResult.data.title || '无标题',
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
        tags: matterResult.data.tags || [],
        author: matterResult.data.author || '匿名',
        category: matterResult.data.category || category,
      };
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  }).filter(Boolean) as PostData[];

  // 按日期排序
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const allFiles = getAllMarkdownFiles(postsDirectory);
  return allFiles.map(({ id }) => ({
    params: { id },
  }));
}

export async function getPostData(id: string): Promise<PostData> {
  // 查找对应的文件路径
  const allFiles = getAllMarkdownFiles(postsDirectory);
  const fileInfo = allFiles.find(file => file.id === id);
  
  if (!fileInfo) {
    throw new Error(`Post with id "${id}" not found`);
  }
  
  const fileContents = fs.readFileSync(fileInfo.filePath, 'utf8');

  // 使用 gray-matter 解析文章元数据
  const matterResult = matter(fileContents);

  // 使用 remark 将 markdown 转换为 HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // 合并数据
  return {
    id,
    content: contentHtml,
    title: matterResult.data.title || '无标题',
    date: matterResult.data.date || new Date().toISOString(),
    excerpt: matterResult.data.excerpt || matterResult.content.slice(0, 150) + '...',
    tags: matterResult.data.tags || [],
    author: matterResult.data.author || '匿名',
    category: matterResult.data.category || fileInfo.category,
  };
}

export function getPostsByCategory(categoryId: string): PostData[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(post => post.category === categoryId);
}