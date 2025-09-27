import { PostData } from './posts';

export interface SearchResult extends PostData {
  score: number;
  matchedKeywords: string[];
}

/**
 * 智能搜索函数
 * @param posts 文章数据数组
 * @param query 搜索查询字符串
 * @returns 按权重排序的搜索结果
 */
export function searchPosts(posts: PostData[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  // 将查询字符串按空格分割成关键词，并清理空字符串
  const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  if (keywords.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  posts.forEach(post => {
    const title = post.title.toLowerCase();
    const excerpt = post.excerpt.toLowerCase();
    const tags = (post.tags || []).join(' ').toLowerCase();
    
    // 计算每个关键词的匹配分数
    const keywordScores: { [key: string]: number } = {};
    const matchedKeywords: string[] = [];

    keywords.forEach((keyword, index) => {
      let score = 0;
      
      // 标题匹配权重最高
      if (title.includes(keyword)) {
        score += 10;
        matchedKeywords.push(keyword);
      }
      
      // 摘要匹配权重中等
      if (excerpt.includes(keyword)) {
        score += 5;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
      
      // 标签匹配权重较低
      if (tags.includes(keyword)) {
        score += 3;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }

      // 第一个关键词权重加倍
      if (index === 0) {
        score *= 2;
      }

      keywordScores[keyword] = score;
    });

    // 计算总分数
    const totalScore = Object.values(keywordScores).reduce((sum, score) => sum + score, 0);

    // 只有匹配到关键词的文章才加入结果
    if (totalScore > 0) {
      results.push({
        ...post,
        score: totalScore,
        matchedKeywords
      });
    }
  });

  // 按分数排序：分数高的在前
  return results.sort((a, b) => {
    // 首先按总分数排序
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    
    // 分数相同时，按匹配关键词数量排序
    if (b.matchedKeywords.length !== a.matchedKeywords.length) {
      return b.matchedKeywords.length - a.matchedKeywords.length;
    }
    
    // 最后按日期排序
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * 高亮搜索关键词
 * @param text 原始文本
 * @param keywords 关键词数组
 * @returns 高亮后的HTML字符串
 */
export function highlightKeywords(text: string, keywords: string[]): string {
  if (!keywords.length) return text;
  
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  });
  
  return highlightedText;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 获取搜索建议
 * @param posts 文章数据数组
 * @param query 当前查询
 * @returns 建议的搜索词
 */
export function getSearchSuggestions(posts: PostData[], query: string): string[] {
  if (!query.trim()) return [];
  
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();
  
  posts.forEach(post => {
    // 从标题中提取建议
    const titleWords = post.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.includes(queryLower) && word !== queryLower) {
        suggestions.add(word);
      }
    });
    
    // 从标签中提取建议
    (post.tags || []).forEach(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes(queryLower) && tagLower !== queryLower) {
        suggestions.add(tag);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
}