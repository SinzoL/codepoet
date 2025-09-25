---
title: "HTTP 安全头部与 Cookie 详解"
date: "2025-09-25"
description: "深入解析 HTTP 安全头部字段，包括 Cache-Control、XSS 防护、CORS 跨域资源共享等关键安全机制"
tags: ["HTTP", "安全", "Cookie", "CORS", "XSS", "缓存"]
category: "backend"
---

在现代 Web 开发中，HTTP 安全头部和 Cookie 管理是保障应用安全的重要基石。本文将深入解析各种安全头部字段的作用机制和最佳实践。

## 目录

1. [Cookie 安全属性](#cookie-安全属性)
2. [Cache-Control 缓存控制](#cache-control-缓存控制)
3. [XSS 防护机制](#xss-防护机制)
4. [CORS 跨域资源共享](#cors-跨域资源共享)
5. [其他重要安全头部](#其他重要安全头部)
6. [实践案例](#实践案例)
7. [安全配置最佳实践](#安全配置最佳实践)

## Cookie 安全属性

### 基本 Cookie 属性

```javascript
// 设置基本 Cookie
document.cookie = "sessionId=abc123; Path=/; Domain=.example.com";

// 服务端设置 Cookie
res.setHeader('Set-Cookie', [
  'sessionId=abc123; HttpOnly; Secure; SameSite=Strict',
  'csrfToken=xyz789; HttpOnly; Secure; SameSite=Lax'
]);
```

### 关键安全属性详解

#### 1. HttpOnly
```javascript
// 防止 JavaScript 访问 Cookie
res.cookie('sessionId', 'abc123', {
  httpOnly: true,  // 防止 XSS 攻击
  secure: true,
  sameSite: 'strict'
});

// 客户端无法访问
console.log(document.cookie); // 不包含 HttpOnly Cookie
```

#### 2. Secure
```javascript
// 只在 HTTPS 连接中传输
res.cookie('sensitiveData', 'secret', {
  secure: true,     // 仅 HTTPS
  httpOnly: true,
  maxAge: 3600000   // 1小时
});
```

#### 3. SameSite
```javascript
// 防止 CSRF 攻击
const cookieOptions = {
  sameSite: 'strict',  // 严格模式
  // sameSite: 'lax',     // 宽松模式
  // sameSite: 'none',    // 无限制（需要 Secure）
  secure: true,
  httpOnly: true
};

res.cookie('authToken', token, cookieOptions);
```

### Cookie 属性对比

| 属性 | 作用 | 安全级别 | 使用场景 |
|------|------|----------|----------|
| `HttpOnly` | 防止 JS 访问 | 高 | 认证 Token |
| `Secure` | 仅 HTTPS 传输 | 高 | 敏感数据 |
| `SameSite=Strict` | 严格同站 | 最高 | 关键操作 |
| `SameSite=Lax` | 宽松同站 | 中 | 一般认证 |
| `SameSite=None` | 无限制 | 低 | 跨站需求 |

## Cache-Control 缓存控制

### 缓存指令详解

#### 1. 响应缓存控制
```javascript
// Express.js 缓存配置
app.use('/static', express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      // 静态资源长期缓存
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.endsWith('.html')) {
      // HTML 文件不缓存
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// API 响应缓存
app.get('/api/data', (req, res) => {
  res.setHeader('Cache-Control', 'private, max-age=300'); // 5分钟私有缓存
  res.json({ data: 'sensitive info' });
});
```

#### 2. 缓存策略配置
```javascript
const cacheStrategies = {
  // 静态资源 - 长期缓存
  staticAssets: 'public, max-age=31536000, immutable',
  
  // API 数据 - 短期缓存
  apiData: 'private, max-age=300, must-revalidate',
  
  // 敏感页面 - 禁止缓存
  sensitive: 'no-cache, no-store, must-revalidate, private',
  
  // 用户内容 - 条件缓存
  userContent: 'private, max-age=0, must-revalidate'
};

// 中间件应用
function setCacheHeaders(strategy) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', cacheStrategies[strategy]);
    next();
  };
}
```

### 缓存指令说明

| 指令 | 作用 | 适用场景 |
|------|------|----------|
| `public` | 可被任何缓存存储 | 静态资源 |
| `private` | 仅用户浏览器缓存 | 个人数据 |
| `no-cache` | 需要验证后使用 | 动态内容 |
| `no-store` | 完全禁止缓存 | 敏感信息 |
| `max-age` | 缓存有效期（秒） | 所有缓存 |
| `must-revalidate` | 过期必须重新验证 | 重要数据 |
| `immutable` | 内容不会改变 | 版本化资源 |

## XSS 防护机制

### 1. Content Security Policy (CSP)

```javascript
// 严格的 CSP 配置
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'", // 谨慎使用
      "https://trusted-cdn.com"
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    fontSrc: ["'self'", "https://fonts.googleapis.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
};

// Express 中使用
app.use((req, res, next) => {
  const csp = Object.entries(cspConfig.directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
});
```

### 2. X-XSS-Protection

```javascript
// XSS 过滤器配置
app.use((req, res, next) => {
  // 启用 XSS 过滤器
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 禁用 XSS 过滤器（现代浏览器推荐）
  // res.setHeader('X-XSS-Protection', '0');
  
  next();
});
```

### 3. 输入输出处理

```javascript
// 输入验证和清理
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

function sanitizeInput(input) {
  // 基本验证
  if (!validator.isLength(input, { min: 1, max: 1000 })) {
    throw new Error('Invalid input length');
  }
  
  // HTML 清理
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  
  return clean;
}

// 输出编码
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

## CORS 跨域资源共享

### 1. 基本 CORS 配置

```javascript
// 简单 CORS 配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://trusted-domain.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24小时
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 2. 动态 CORS 配置

```javascript
const corsConfig = {
  allowedOrigins: [
    'https://app.example.com',
    'https://admin.example.com',
    /^https:\/\/.*\.example\.com$/
  ],
  
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token'
  ]
};

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  
  // 检查来源是否被允许
  const isAllowed = corsConfig.allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return allowed === origin;
    } else if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  });
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // 预检请求处理
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', corsConfig.allowedMethods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.sendStatus(200);
  }
  
  next();
}
```

### 3. CORS 预检请求

```javascript
// 复杂请求的预检处理
function handlePreflightRequest(req, res) {
  const requestMethod = req.headers['access-control-request-method'];
  const requestHeaders = req.headers['access-control-request-headers'];
  
  // 验证请求方法
  if (!corsConfig.allowedMethods.includes(requestMethod)) {
    return res.status(405).end();
  }
  
  // 验证请求头
  if (requestHeaders) {
    const headers = requestHeaders.split(',').map(h => h.trim());
    const invalidHeaders = headers.filter(h => 
      !corsConfig.allowedHeaders.includes(h)
    );
    
    if (invalidHeaders.length > 0) {
      return res.status(400).end();
    }
  }
  
  // 设置预检响应头
  res.setHeader('Access-Control-Allow-Methods', requestMethod);
  res.setHeader('Access-Control-Allow-Headers', requestHeaders || '');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.sendStatus(200);
}
```

## 其他重要安全头部

### 1. 内容类型保护

```javascript
// X-Content-Type-Options
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 正确设置 Content-Type
app.get('/api/data.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.json({ data: 'example' });
});
```

### 2. 点击劫持防护

```javascript
// X-Frame-Options
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  // 或者允许同源
  // res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // 或者允许特定域名
  // res.setHeader('X-Frame-Options', 'ALLOW-FROM https://trusted.com');
  next();
});
```

### 3. HTTPS 强制

```javascript
// Strict-Transport-Security (HSTS)
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// 重定向到 HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
```

## 实践案例

### 完整的安全头部配置

```javascript
const express = require('express');
const app = express();

// 安全头部中间件
function securityHeaders(req, res, next) {
  // 基本安全头部
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0'); // 现代浏览器推荐禁用
  
  // HSTS
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 
      'max-age=31536000; includeSubDomains; preload');
  }
  
  // CSP
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.example.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  next();
}

// 应用安全中间件
app.use(securityHeaders);

// Cookie 配置
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24小时
  },
  resave: false,
  saveUninitialized: false
}));
```

### API 安全配置

```javascript
// API 路由安全配置
app.use('/api', (req, res, next) => {
  // API 特定的缓存策略
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // API 版本头部
  res.setHeader('API-Version', '1.0');
  
  // 速率限制信息
  res.setHeader('X-RateLimit-Limit', '1000');
  res.setHeader('X-RateLimit-Remaining', req.rateLimit?.remaining || 0);
  
  next();
});

// 认证 API
app.post('/api/auth/login', (req, res) => {
  // 登录逻辑...
  
  // 设置认证 Cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15分钟
  });
  
  // 设置 CSRF Token
  res.cookie('csrfToken', csrfToken, {
    httpOnly: false, // 需要 JS 访问
    secure: true,
    sameSite: 'strict'
  });
  
  res.json({ success: true });
});
```

## 安全配置最佳实践

### 1. 分层安全策略

```javascript
const securityLevels = {
  // 公开内容
  public: {
    cacheControl: 'public, max-age=3600',
    csp: "default-src 'self' 'unsafe-inline'",
    frameOptions: 'SAMEORIGIN'
  },
  
  // 用户内容
  user: {
    cacheControl: 'private, no-cache',
    csp: "default-src 'self'",
    frameOptions: 'DENY'
  },
  
  // 管理员内容
  admin: {
    cacheControl: 'no-cache, no-store, must-revalidate',
    csp: "default-src 'self'; script-src 'self'",
    frameOptions: 'DENY',
    requireHttps: true
  }
};

function applySecurityLevel(level) {
  return (req, res, next) => {
    const config = securityLevels[level];
    
    res.setHeader('Cache-Control', config.cacheControl);
    res.setHeader('Content-Security-Policy', config.csp);
    res.setHeader('X-Frame-Options', config.frameOptions);
    
    if (config.requireHttps && !req.secure) {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    
    next();
  };
}
```

### 2. 安全监控

```javascript
// 安全事件记录
function logSecurityEvent(type, details, req) {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    details,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer
  };
  
  console.log('Security Event:', JSON.stringify(event));
  
  // 发送到安全监控系统
  // securityMonitor.log(event);
}

// CSP 违规报告
app.post('/csp-report', express.json(), (req, res) => {
  const report = req.body['csp-report'];
  
  logSecurityEvent('CSP_VIOLATION', {
    blockedUri: report['blocked-uri'],
    violatedDirective: report['violated-directive'],
    originalPolicy: report['original-policy']
  }, req);
  
  res.sendStatus(204);
});
```

### 3. 配置验证

```javascript
// 安全配置验证
function validateSecurityConfig() {
  const checks = [
    {
      name: 'HTTPS Required',
      check: () => process.env.NODE_ENV === 'production' ? 
        process.env.FORCE_HTTPS === 'true' : true
    },
    {
      name: 'Session Secret',
      check: () => process.env.SESSION_SECRET && 
        process.env.SESSION_SECRET.length >= 32
    },
    {
      name: 'CSP Configured',
      check: () => process.env.CSP_POLICY !== undefined
    }
  ];
  
  const failed = checks.filter(check => !check.check());
  
  if (failed.length > 0) {
    console.error('Security configuration issues:');
    failed.forEach(check => console.error(`- ${check.name}`));
    process.exit(1);
  }
  
  console.log('Security configuration validated ✓');
}

// 启动时验证
validateSecurityConfig();
```

## 总结

HTTP 安全头部和 Cookie 管理是 Web 应用安全的基础：

### 关键要点
1. **Cookie 安全**: 使用 HttpOnly、Secure、SameSite 属性
2. **缓存控制**: 根据内容敏感性设置合适的缓存策略
3. **XSS 防护**: 实施 CSP、输入验证、输出编码
4. **CORS 配置**: 严格控制跨域访问权限
5. **安全头部**: 全面配置各种安全相关的 HTTP 头部

### 最佳实践
- 采用分层安全策略
- 定期审查和更新安全配置
- 监控安全事件和违规行为
- 在开发和生产环境中测试安全配置

通过正确配置这些安全机制，可以有效防护常见的 Web 安全威胁，保障应用和用户数据的安全。