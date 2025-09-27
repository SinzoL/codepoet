/** @type {import('next').NextConfig} */
const nextConfig = {
  // 实验性功能配置
  experimental: {
    // 其他实验性功能可以在这里配置
  },

  // 图片优化配置
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 编译优化
  compiler: {
    // 移除 console.log (仅在生产环境)
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 输出配置
  output: 'standalone',
  
  // 静态导出配置（如果需要）
  trailingSlash: false,
  
  // 性能优化
  poweredByHeader: false,
  
  // 重定向配置
  async redirects() {
    return [
      // 将旧的 /categories 路径重定向到 /tech
      {
        source: '/categories/:path*',
        destination: '/tech/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;