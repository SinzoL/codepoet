import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts/tech');

// 清理 Markdown 语法，返回纯文本
function cleanMarkdownText(text: string): string {
  return text
    // 移除代码块标记 (```code```) - 优先处理，避免代码块中的特殊字符干扰
    .replace(/```[\s\S]*?```/g, ' ')
    // 移除行内代码 (`code`)
    .replace(/`([^`]+)`/g, ' ')
    // 移除 HTML 标签
    .replace(/<[^>]*>/g, ' ')
    // 移除标题符号 (# ## ### 等)
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体 (**text** *text*)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    // 移除链接 [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片 ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 移除列表符号 (- * +)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // 移除数字列表 (1. 2. 3.)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // 移除引用符号 (>)
    .replace(/^>\s+/gm, '')
    // 移除 JavaScript 注释 (// 和 /* */)
    .replace(/\/\/.*$/gm, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    // 移除正则表达式相关的特殊字符序列
    .replace(/\\\w/g, ' ')
    .replace(/\[\\s\\S\]/g, ' ')
    .replace(/\[\^[^\]]*\]/g, ' ')
    // 移除其他常见的正则表达式符号
    .replace(/[\\$^*+?.()|[\]{}]/g, ' ')
    // 移除多余的空白字符
    .replace(/\s+/g, ' ')
    // 移除多余的空行
    .replace(/\n\s*\n/g, '\n')
    // 移除行首行尾空白
    .trim();
}

export interface PostData {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content?: string;
  tags?: string[];
  author?: string;
  techCategory?: string;
}

// 递归读取技术文章目录中的 markdown 文件
function getAllMarkdownFiles(dir: string, fileList: { filePath: string; id: string; techCategory: string }[] = []): { filePath: string; id: string; techCategory: string }[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 递归读取子文件夹（现在只读取 posts/tech 下的技术分类）
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      // 生成唯一的 id，包含文件夹路径信息
      const relativePath = path.relative(postsDirectory, filePath);
      const pathParts = relativePath.split(path.sep);
      const techCategory = pathParts.length > 1 ? pathParts[0] : 'general';
      const fileName = pathParts[pathParts.length - 1];
      const id = relativePath.replace(/\.md$/, '').replace(/\//g, '-').replace(/\\/g, '-');
      
      fileList.push({ filePath, id, techCategory });
    }
  });
  
  return fileList;
}

export function getSortedPostsData(): PostData[] {
  // 获取所有 markdown 文件
  const allFiles = getAllMarkdownFiles(postsDirectory);
  
  const allPostsData = allFiles.map(({ filePath, id, techCategory }) => {
    try {
      // 读取 markdown 文件内容
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // 使用 gray-matter 解析文章元数据
      const matterResult = matter(fileContents);

      // 生成清理后的摘要
      const cleanContent = cleanMarkdownText(matterResult.content);
      const autoExcerpt = cleanContent.slice(0, 150) + (cleanContent.length > 150 ? '...' : '');
      
      // 合并数据和 id
      return {
        id,
        title: matterResult.data.title || '无标题',
        date: matterResult.data.date || new Date().toISOString(),
        excerpt: matterResult.data.excerpt || autoExcerpt,
        tags: matterResult.data.tags || [],
        author: matterResult.data.author || '匿名',
        techCategory: matterResult.data.techCategory || techCategory,
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

  // 生成清理后的摘要
  const cleanContent = cleanMarkdownText(matterResult.content);
  const autoExcerpt = cleanContent.slice(0, 150) + (cleanContent.length > 150 ? '...' : '');
  
  // 合并数据
  return {
    id,
    content: contentHtml,
    title: matterResult.data.title || '无标题',
    date: matterResult.data.date || new Date().toISOString(),
    excerpt: matterResult.data.excerpt || autoExcerpt,
    tags: matterResult.data.tags || [],
    author: matterResult.data.author || '匿名',
    techCategory: matterResult.data.techCategory || fileInfo.techCategory,
  };
}

export function getPostsByTechCategory(techCategoryId: string): PostData[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter(post => post.techCategory === techCategoryId);
}