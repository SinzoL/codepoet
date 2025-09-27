import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { cache } from './cache';

const postsDirectory = path.join(process.cwd(), 'posts/tech');

export interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  tags?: string[];
  author?: string;
  techCategory?: string;
  readingTime?: number;
}

// 计算阅读时间（基于250字/分钟）
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 250;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// 清理 Markdown 语法，返回纯文本
function cleanMarkdownText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 获取文件修改时间
function getFileModTime(filePath: string): number {
  try {
    return fs.statSync(filePath).mtime.getTime();
  } catch {
    return 0;
  }
}

// 递归读取所有 markdown 文件（带缓存）
function getAllMarkdownFiles(): { filePath: string; id: string; techCategory: string; modTime: number }[] {
  const cacheKey = 'markdown-files-list';
  const cached = cache.get<{ files: { filePath: string; id: string; techCategory: string; modTime: number }[]; dirModTime: number }>(cacheKey);
  
  // 检查目录修改时间
  const dirModTime = getFileModTime(postsDirectory);
  if (cached && cached.dirModTime === dirModTime) {
    return cached.files;
  }

  const fileList: { filePath: string; id: string; techCategory: string; modTime: number }[] = [];

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.md')) {
        const relativePath = path.relative(postsDirectory, filePath);
        const pathParts = relativePath.split(path.sep);
        const techCategory = pathParts.length > 1 ? pathParts[0] : 'general';
        const id = relativePath.replace(/\.md$/, '').replace(/\//g, '-').replace(/\\/g, '-');
        
        fileList.push({ 
          filePath, 
          id, 
          techCategory,
          modTime: stat.mtime.getTime()
        });
      }
    });
  }

  scanDirectory(postsDirectory);

  // 缓存文件列表
  cache.set(cacheKey, { files: fileList, dirModTime }, 10 * 60 * 1000); // 10分钟缓存
  
  return fileList;
}

// 解析单个文章（带缓存）
async function parsePost(filePath: string, id: string, techCategory: string, modTime: number): Promise<PostData | null> {
  const cacheKey = `post-${id}-${modTime}`;
  const cached = cache.get<PostData>(cacheKey);
  if (cached) return cached;

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const matterResult = matter(fileContents);
    
    // 清理内容用于摘要
    const cleanContent = cleanMarkdownText(matterResult.content);
    const excerpt = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
    
    const postData: PostData = {
      id,
      title: matterResult.data.title || '无标题',
      date: matterResult.data.date || new Date().toISOString(),
      excerpt,
      tags: matterResult.data.tags || [],
      author: matterResult.data.author || 'CodePoet',
      techCategory,
      readingTime: calculateReadingTime(cleanContent)
    };

    // 缓存解析结果
    cache.set(cacheKey, postData, 30 * 60 * 1000); // 30分钟缓存
    
    return postData;
  } catch (error) {
    console.error(`Error parsing post ${filePath}:`, error);
    return null;
  }
}

// 获取排序后的文章数据（优化版）
export async function getSortedPostsData(): Promise<PostData[]> {
  const cacheKey = 'sorted-posts-data';
  const cached = cache.get<PostData[]>(cacheKey);
  if (cached) return cached;

  const allFiles = getAllMarkdownFiles();
  
  // 并行处理文章解析
  const parsePromises = allFiles.map(({ filePath, id, techCategory, modTime }) =>
    parsePost(filePath, id, techCategory, modTime)
  );
  
  const allPostsData = (await Promise.all(parsePromises))
    .filter((post): post is PostData => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 缓存结果
  cache.set(cacheKey, allPostsData, 5 * 60 * 1000); // 5分钟缓存
  
  return allPostsData;
}

// 获取单篇文章数据（带内容）
export async function getPostData(id: string): Promise<PostData | null> {
  const cacheKey = `post-content-${id}`;
  const cached = cache.get<PostData>(cacheKey);
  if (cached) return cached;

  const allFiles = getAllMarkdownFiles();
  const fileInfo = allFiles.find(f => f.id === id);
  
  if (!fileInfo) return null;

  try {
    const fileContents = fs.readFileSync(fileInfo.filePath, 'utf8');
    const matterResult = matter(fileContents);
    
    // 处理 Markdown 内容
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(matterResult.content);
    
    const cleanContent = cleanMarkdownText(matterResult.content);
    const excerpt = cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : '');
    
    const postData: PostData = {
      id,
      title: matterResult.data.title || '无标题',
      date: matterResult.data.date || new Date().toISOString(),
      excerpt,
      content: processedContent.toString(),
      tags: matterResult.data.tags || [],
      author: matterResult.data.author || 'CodePoet',
      techCategory: fileInfo.techCategory,
      readingTime: calculateReadingTime(cleanContent)
    };

    // 缓存带内容的文章数据
    cache.set(cacheKey, postData, 15 * 60 * 1000); // 15分钟缓存
    
    return postData;
  } catch (error) {
    console.error(`Error getting post data for ${id}:`, error);
    return null;
  }
}

// 按技术分类获取文章
export async function getPostsByTechCategory(techCategory: string): Promise<PostData[]> {
  const allPosts = await getSortedPostsData();
  return allPosts.filter(post => post.techCategory === techCategory);
}

// 获取所有文章ID（用于静态生成）
export function getAllPostIds(): { params: { id: string } }[] {
  const allFiles = getAllMarkdownFiles();
  return allFiles.map(({ id }) => ({
    params: { id }
  }));
}