// 内存缓存系统
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分钟

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// 定期清理过期缓存
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60000); // 每分钟清理一次
}

// 缓存包装函数
import { getSortedPostsData } from './posts';
import { techCategories } from './tech';

export async function getCachedPosts() {
  const cacheKey = 'all-posts';
  let posts = cache.get(cacheKey);
  
  if (!posts) {
    posts = await getSortedPostsData();
    cache.set(cacheKey, posts, 5 * 60 * 1000); // 5分钟缓存
  }
  
  return posts;
}

export async function getCachedTechCategories() {
  const cacheKey = 'tech-categories';
  let categories = cache.get(cacheKey);
  
  if (!categories) {
    categories = techCategories;
    cache.set(cacheKey, categories, 10 * 60 * 1000); // 10分钟缓存
  }
  
  return categories;
}