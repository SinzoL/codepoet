// 性能监控和优化工具

// Web Vitals 监控
interface WebVitalsMetric {
  name: string;
  id: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, parameters: Record<string, unknown>) => void;
  }
}

export function reportWebVitals(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV === 'production') {
    // 这里可以发送到分析服务
    console.log(metric);
    
    // 示例：发送到 Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
  }
}

// 预加载关键资源
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // 预加载字体
  const fontLinks = [
    '/fonts/geist-sans.woff2',
    '/fonts/geist-mono.woff2',
  ];

  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// 图片懒加载观察器
export class LazyImageObserver {
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              if (src) {
                img.src = src;
                img.classList.remove('lazy');
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01,
        }
      );
    }
  }

  observe(element: HTMLElement) {
    this.observer?.observe(element);
  }

  disconnect() {
    this.observer?.disconnect();
  }
}

// 代码分割和动态导入助手
export const dynamicImports = {
  // 懒加载代码高亮
  PrismHighlighter: () => import('prismjs').catch(() => null),
};

// 资源预取
export function prefetchRoute(href: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

// 关键资源预连接
export function preconnectDomains() {
  if (typeof window === 'undefined') return;

  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // 添加其他外部域名
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// 内存使用监控
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: MemoryInfo;
  }
}

export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !performance.memory) return;

  const memory = performance.memory;
  
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
}

// 网络状态监控
interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
  }
}

export function getNetworkInfo() {
  if (typeof window === 'undefined' || !navigator.connection) {
    return { effectiveType: 'unknown', downlink: 0, rtt: 0, saveData: false };
  }

  const connection = navigator.connection;
  
  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

// 性能优化建议
export function getPerformanceRecommendations() {
  const networkInfo = getNetworkInfo();
  const memoryInfo = monitorMemoryUsage();
  
  const recommendations = [];
  
  // 基于网络状况的建议
  if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
    recommendations.push('启用数据节省模式');
    recommendations.push('减少图片质量');
  }
  
  // 基于内存使用的建议
  if (memoryInfo && memoryInfo.used > memoryInfo.limit * 0.8) {
    recommendations.push('清理缓存');
    recommendations.push('减少同时打开的页面');
  }
  
  return recommendations;
}