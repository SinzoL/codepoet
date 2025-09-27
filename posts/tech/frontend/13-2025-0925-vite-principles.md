---
title: "Vite 构建原理与实践详解"
date: "2025-09-25"
description: "深入解析 Vite 的构建原理、底层实现机制、插件系统和性能优化策略"
tags: ["Vite", "构建工具", "ESM", "HMR", "性能优化", "前端工程化"]
---

## Vite 核心理念

### 传统构建工具的问题

**Webpack 的痛点**:
```javascript
// webpack.config.js - 复杂的配置
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    contentBase: './dist',
    hot: true
  }
};

// 问题：
// 1. 冷启动慢 - 需要打包整个应用
// 2. 热更新慢 - 重新打包相关模块
// 3. 配置复杂 - 需要大量配置
```

### Vite 的解决方案

**基于 ESM 的开发服务器**:
```javascript
// Vite 的核心思想
/*
传统构建流程：
源码 → 打包 → Bundle → 开发服务器

Vite 开发流程：
源码 → ESM 导入 → 按需编译 → 浏览器
*/

// 示例：Vite 如何处理模块导入
// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');

// 浏览器实际请求：
// GET /src/main.js
// GET /src/App.vue
// GET /src/style.css
// GET /node_modules/vue/dist/vue.esm-bundler.js

// Vite 服务器实时转换：
// 1. .vue 文件 → JavaScript 模块
// 2. .css 文件 → JavaScript 模块 (CSS-in-JS)
// 3. TypeScript → JavaScript
// 4. 依赖预构建 → ESM 格式
```

## Vite 架构原理

### 开发环境架构

**ESM 开发服务器**:
```javascript
// Vite 开发服务器核心实现 (简化版)
import { createServer } from 'http';
import { parse } from 'url';
import { readFile } from 'fs/promises';
import { transform } from 'esbuild';

class ViteDevServer {
  constructor(config) {
    this.config = config;
    this.moduleGraph = new Map(); // 模块依赖图
    this.plugins = []; // 插件系统
  }
  
  async createServer() {
    const server = createServer(async (req, res) => {
      const { pathname } = parse(req.url);
      
      try {
        // 1. 静态资源处理
        if (pathname.startsWith('/src/')) {
          await this.handleSourceFile(pathname, res);
        }
        // 2. node_modules 处理
        else if (pathname.startsWith('/node_modules/')) {
          await this.handleNodeModules(pathname, res);
        }
        // 3. 入口 HTML 处理
        else if (pathname === '/' || pathname === '/index.html') {
          await this.handleIndexHtml(res);
        }
        // 4. HMR 处理
        else if (pathname === '/@vite/client') {
          await this.handleHMRClient(res);
        }
      } catch (error) {
        this.handleError(error, res);
      }
    });
    
    return server;
  }
  
  async handleSourceFile(pathname, res) {
    const filePath = `.${pathname}`;
    const content = await readFile(filePath, 'utf-8');
    
    // 根据文件类型进行转换
    let transformedContent;
    
    if (pathname.endsWith('.ts') || pathname.endsWith('.tsx')) {
      // TypeScript 转换
      const result = await transform(content, {
        loader: 'tsx',
        format: 'esm',
        target: 'es2020'
      });
      transformedContent = result.code;
    }
    else if (pathname.endsWith('.vue')) {
      // Vue SFC 转换
      transformedContent = await this.transformVueSFC(content, pathname);
    }
    else if (pathname.endsWith('.css')) {
      // CSS 转换为 JS 模块
      transformedContent = this.transformCSS(content, pathname);
    }
    else {
      // JavaScript 文件处理导入路径
      transformedContent = this.transformImports(content);
    }
    
    res.setHeader('Content-Type', 'application/javascript');
    res.end(transformedContent);
  }
  
  transformImports(code) {
    // 转换裸导入为相对路径
    return code.replace(
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      (match, id) => {
        if (id.startsWith('./') || id.startsWith('../')) {
          return match; // 相对路径不变
        }
        // 裸导入转换为 node_modules 路径
        return match.replace(id, `/node_modules/${id}`);
      }
    );
  }
  
  transformCSS(content, pathname) {
    // CSS 转换为 JavaScript 模块
    return `
      const css = ${JSON.stringify(content)};
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      export default css;
    `;
  }
  
  async transformVueSFC(content, pathname) {
    // Vue SFC 编译 (简化实现)
    const { parse, compileTemplate, compileScript } = await import('@vue/compiler-sfc');
    
    const { descriptor } = parse(content);
    const id = pathname;
    
    let code = '';
    
    // 编译 script 部分
    if (descriptor.script || descriptor.scriptSetup) {
      const scriptResult = compileScript(descriptor, { id });
      code += scriptResult.content;
    }
    
    // 编译 template 部分
    if (descriptor.template) {
      const templateResult = compileTemplate({
        source: descriptor.template.content,
        id
      });
      code += `\n${templateResult.code}`;
    }
    
    // 处理 style 部分
    if (descriptor.styles.length) {
      descriptor.styles.forEach((style, index) => {
        const styleId = `${id}?type=style&index=${index}`;
        code += `\nimport "${styleId}";`;
      });
    }
    
    return code;
  }
}
```

### 依赖预构建

**esbuild 预构建**:
```javascript
// 依赖预构建实现
import { build } from 'esbuild';
import { resolve } from 'path';

class DependencyPreBundler {
  constructor(config) {
    this.config = config;
    this.cacheDir = resolve(config.root, 'node_modules/.vite');
  }
  
  async preBundleDependencies() {
    // 1. 扫描依赖
    const dependencies = await this.scanDependencies();
    
    // 2. 检查缓存
    const needsRebuild = await this.checkCache(dependencies);
    
    if (needsRebuild) {
      // 3. 使用 esbuild 预构建
      await this.buildDependencies(dependencies);
    }
    
    return this.generateDependencyMap(dependencies);
  }
  
  async scanDependencies() {
    const dependencies = new Set();
    
    // 扫描入口文件
    const entryFiles = await this.getEntryFiles();
    
    for (const file of entryFiles) {
      await this.scanFile(file, dependencies);
    }
    
    return Array.from(dependencies);
  }
  
  async scanFile(filePath, dependencies) {
    const content = await readFile(filePath, 'utf-8');
    
    // 使用 esbuild 解析导入
    const result = await build({
      stdin: {
        contents: content,
        resolveDir: dirname(filePath)
      },
      bundle: false,
      write: false,
      plugins: [
        {
          name: 'scan-deps',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              // 收集裸导入
              if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
                dependencies.add(args.path);
              }
              return { external: true };
            });
          }
        }
      ]
    });
  }
  
  async buildDependencies(dependencies) {
    const entryPoints = {};
    
    // 为每个依赖创建入口点
    dependencies.forEach(dep => {
      entryPoints[dep] = dep;
    });
    
    // 使用 esbuild 构建
    await build({
      entryPoints,
      bundle: true,
      format: 'esm',
      target: 'es2020',
      outdir: this.cacheDir,
      splitting: true,
      plugins: [
        // 处理 CommonJS 依赖
        {
          name: 'commonjs-external',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              // 标记为外部依赖，避免重复打包
              if (dependencies.includes(args.path)) {
                return { external: true };
              }
            });
          }
        }
      ]
    });
  }
  
  generateDependencyMap(dependencies) {
    const map = {};
    
    dependencies.forEach(dep => {
      map[dep] = `${this.cacheDir}/${dep}.js`;
    });
    
    return map;
  }
}

// 使用示例
const preBundler = new DependencyPreBundler({
  root: process.cwd()
});

const dependencyMap = await preBundler.preBundleDependencies();
// 结果：
// {
//   'vue': '/node_modules/.vite/vue.js',
//   'lodash': '/node_modules/.vite/lodash.js'
// }
```

### HMR (热模块替换) 实现

HMR 是 Vite 最核心的功能之一，它通过 WebSocket 实现服务器和浏览器之间的实时通信，让开发者能够在不刷新页面的情况下看到代码变更的效果。

#### WebSocket 通信机制

**什么是 WebSocket？**

WebSocket 是一种全双工通信协议，允许服务器主动向客户端推送数据。与传统的 HTTP 请求-响应模式不同，WebSocket 建立持久连接，实现真正的实时通信。

**在 Vite 中的运行位置：**
- **服务端**：Vite 开发服务器启动 WebSocket 服务（通常在 24678 端口）
- **客户端**：浏览器页面自动连接到这个 WebSocket 服务

#### 文件变化检测与处理流程

**完整的 HMR 工作流程：**

1. **文件监听**：Vite 服务器使用 `chokidar` 监听文件系统变化
2. **变化检测**：当文件保存时，监听器立即检测到变化
3. **影响分析**：分析哪些模块受到影响，确定更新范围
4. **模块重编译**：使用 esbuild 重新编译变化的模块
5. **消息推送**：通过 WebSocket 推送更新通知（不是代码本身）
6. **浏览器处理**：浏览器接收通知后，主动请求新的模块代码
7. **模块替换**：替换旧模块，保持应用状态

**关键点：WebSocket 推送的是消息，不是代码！**

```javascript
// HMR 服务端实现
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';

class HMRServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Set();
    this.moduleGraph = new Map();
    this.setupFileWatcher();
  }
  
  setupFileWatcher() {
    // 文件监听器 - 运行在服务器端
    this.watcher = chokidar.watch('./src', {
      ignored: /node_modules/,
      persistent: true
    });
    
    this.watcher.on('change', (filePath) => {
      console.log(`文件变化: ${filePath}`);
      this.handleFileChange(filePath);
    });
  }
  
  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('客户端已连接');
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('客户端已断开');
      });
      
      // 发送连接确认消息
      ws.send(JSON.stringify({
        type: 'connected'
      }));
    });
  }
  
  // 文件变更处理 - 这是核心逻辑
  async handleFileChange(filePath) {
    console.log(`处理文件变化: ${filePath}`);
    
    // 第一步：分析影响范围
    const fileType = this.getFileType(filePath);
    const affectedModules = this.analyzeModuleDependencies(filePath);
    
    // 第二步：重新编译模块
    try {
      const newCode = await this.recompileModule(filePath);
      
      // 更新内存中的模块缓存
      this.moduleCache.set(filePath, newCode);
      
      console.log(`模块重编译完成: ${filePath}`);
    } catch (error) {
      console.error(`编译失败: ${filePath}`, error);
      this.broadcast({ type: 'error', error: error.message });
      return;
    }
    
    // 第三步：推送更新通知消息
    const updateMessage = {
      type: 'update',
      updates: [{
        type: fileType === 'css' ? 'css-update' : 'js-update',
        path: filePath,
        acceptedPath: filePath,
        timestamp: Date.now()
      }]
    };
    
    console.log('推送更新消息:', updateMessage);
    this.broadcast(updateMessage);
  }
  
  async recompileModule(filePath) {
    // 使用 esbuild 或相应的转换器重新编译
    if (filePath.endsWith('.vue')) {
      return await this.transformVueSFC(filePath);
    } else if (filePath.endsWith('.ts')) {
      return await this.transformTypeScript(filePath);
    } else if (filePath.endsWith('.css')) {
      return await this.transformCSS(filePath);
    }
    // ... 其他文件类型处理
  }
  
  broadcast(message) {
    const data = JSON.stringify(message);
    console.log(`广播消息给 ${this.clients.size} 个客户端:`, message.type);
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(data);
      }
    });
  }
}
```

#### 浏览器端 HMR 客户端

```javascript
// HMR 客户端实现 - 运行在浏览器中
class HMRClient {
  constructor() {
    this.socket = null;
    this.isFirstUpdate = true;
  }
  
  connect() {
    // 连接到 Vite 服务器的 WebSocket
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${location.host}:24678`;
    
    console.log('连接 HMR WebSocket:', url);
    this.socket = new WebSocket(url);
    
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      console.log('收到 HMR 消息:', message);
      this.handleMessage(message);
    });
    
    this.socket.addEventListener('close', () => {
      console.log('[vite] 服务器连接丢失，尝试重连...');
      this.reconnect();
    });
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'connected':
        console.log('[vite] HMR 连接已建立');
        break;
        
      case 'update':
        console.log('[vite] 收到更新通知:', message.updates);
        this.handleUpdate(message.updates);
        break;
        
      case 'full-reload':
        console.log('[vite] 执行完整页面刷新');
        location.reload();
        break;
        
      case 'error':
        console.error('[vite] HMR 错误:', message.error);
        break;
    }
  }
  
  async handleUpdate(updates) {
    for (const update of updates) {
      console.log(`处理更新: ${update.type} - ${update.path}`);
      
      if (update.type === 'js-update') {
        await this.updateJavaScriptModule(update);
      } else if (update.type === 'css-update') {
        this.updateCSSModule(update);
      }
    }
  }
  
  async updateJavaScriptModule(update) {
    const { path, timestamp } = update;
    
    console.log(`更新 JS 模块: ${path}`);
    
    // 关键：浏览器主动请求新的模块代码
    // WebSocket 只是通知，代码通过 HTTP 获取
    try {
      const newModule = await import(`${path}?t=${timestamp}`);
      console.log('新模块加载成功:', newModule);
      
      // 查找并执行 HMR 回调
      const callbacks = this.getHMRCallbacks(path);
      for (const callback of callbacks) {
        await callback(newModule);
      }
      
      console.log(`模块 ${path} 热更新完成`);
    } catch (error) {
      console.error(`模块更新失败: ${path}`, error);
      console.log('回退到完整页面刷新');
      location.reload();
    }
  }
  
  updateCSSModule(update) {
    const { path, timestamp } = update;
    
    console.log(`更新 CSS 模块: ${path}`);
    
    // 查找现有的样式标签
    const existingLink = document.querySelector(`link[href*="${path}"]`);
    
    if (existingLink) {
      // 创建新的样式标签
      const newLink = existingLink.cloneNode();
      newLink.href = `${path}?t=${timestamp}`;
      
      newLink.addEventListener('load', () => {
        // 新样式加载完成后移除旧样式
        existingLink.remove();
        console.log(`CSS 模块 ${path} 热更新完成`);
      });
      
      // 插入新样式标签
      existingLink.parentNode.insertBefore(newLink, existingLink.nextSibling);
    }
  }
  
  reconnect() {
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// 自动启动 HMR 客户端
const hmrClient = new HMRClient();
hmrClient.connect();
```

#### 实际推送的消息格式

**JavaScript 文件变化时的消息：**
```javascript
{
  type: 'update',
  updates: [
    {
      type: 'js-update',           // 更新类型
      path: '/src/components/Button.vue',  // 文件路径
      acceptedPath: '/src/components/Button.vue',
      timestamp: 1695825600000     // 时间戳，用于缓存破坏
    }
  ]
}
```

**CSS 文件变化时的消息：**
```javascript
{
  type: 'update',
  updates: [
    {
      type: 'css-update',
      path: '/src/styles/main.css',
      timestamp: 1695825600000
    }
  ]
}
```

**需要完全刷新时的消息：**
```javascript
{
  type: 'full-reload'
}
```

#### HMR API 使用

```javascript
// 在模块中使用 HMR API
if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept((newModule) => {
    console.log('模块自身更新:', newModule);
    // 执行更新逻辑，比如重新渲染组件
  });
  
  // 接受特定依赖的更新
  import.meta.hot.accept('./utils.js', (newUtils) => {
    console.log('工具模块更新:', newUtils);
    // 处理依赖更新
  });
  
  // 模块销毁时的清理工作
  import.meta.hot.dispose((data) => {
    // 清理定时器、事件监听器等副作用
    if (data.timer) {
      clearInterval(data.timer);
    }
  });
  
  // 保存状态到下次更新
  import.meta.hot.data.timer = setInterval(() => {
    console.log('定时任务运行中...');
  }, 1000);
}
```

#### 为什么这样设计？

**分离关注点：**
- **WebSocket**：负责实时通知，传输轻量级消息
- **HTTP**：负责传输具体的代码内容
- 这样设计让架构更清晰，性能更好

**实时性保证：**
- 文件一保存，WebSocket 立即推送通知
- 浏览器收到通知后立即请求新代码
- 整个过程通常在 100ms 内完成

**状态保持：**
- 只替换变化的模块，不影响其他模块
- 保持应用的运行状态（表单数据、滚动位置等）
- 提供极佳的开发体验

这就是 Vite HMR 的完整工作原理：通过 WebSocket 实现实时通知，通过模块化的方式实现精确更新，让开发者能够享受到毫秒级的热更新体验！

## 插件系统

### 插件架构

**Rollup 插件兼容**:
```javascript
// Vite 插件基础结构
function createVitePlugin(options = {}) {
  return {
    name: 'my-vite-plugin',
    
    // 构建钩子 (Rollup 兼容)
    buildStart(opts) {
      // 构建开始时执行
    },
    
    resolveId(id, importer) {
      // 解析模块 ID
      if (id === 'virtual:my-module') {
        return id;
      }
    },
    
    load(id) {
      // 加载模块内容
      if (id === 'virtual:my-module') {
        return 'export default "Hello from virtual module"';
      }
    },
    
    transform(code, id) {
      // 转换模块代码
      if (id.endsWith('.special')) {
        return {
          code: transformSpecialFile(code),
          map: null
        };
      }
    },
    
    // Vite 特有钩子
    config(config, { command }) {
      // 修改配置
      if (command === 'serve') {
        config.define = config.define || {};
        config.define.__DEV__ = true;
      }
    },
    
    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use('/api', (req, res, next) => {
        // 自定义中间件
        if (req.url === '/api/hello') {
          res.end('Hello from plugin!');
        } else {
          next();
        }
      });
    },
    
    handleHotUpdate(ctx) {
      // 处理 HMR 更新
      const { file, server } = ctx;
      
      if (file.endsWith('.special')) {
        // 自定义 HMR 逻辑
        server.ws.send({
          type: 'full-reload'
        });
        return [];
      }
    }
  };
}

// 使用插件
// vite.config.js
import { defineConfig } from 'vite';
import { createVitePlugin } from './plugins/my-plugin';

export default defineConfig({
  plugins: [
    createVitePlugin({
      // 插件选项
    })
  ]
});
```

### 常用插件实现

**Vue 插件实现**:
```javascript
// @vitejs/plugin-vue 核心实现
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc';

function vuePlugin(options = {}) {
  const cache = new Map();
  
  return {
    name: 'vite:vue',
    
    load(id) {
      // 处理 Vue SFC 的不同部分
      const { filename, query } = parseVueRequest(id);
      
      if (query.vue) {
        const descriptor = cache.get(filename);
        
        if (query.type === 'template') {
          return compileTemplate({
            source: descriptor.template.content,
            filename,
            id: query.id,
            scoped: descriptor.styles.some(s => s.scoped),
            ...options.template
          }).code;
        }
        
        if (query.type === 'style') {
          const style = descriptor.styles[query.index];
          return style.content;
        }
      }
    },
    
    transform(code, id) {
      const { filename, query } = parseVueRequest(id);
      
      if (!filename.endsWith('.vue') || query.vue) {
        return;
      }
      
      // 解析 SFC
      const { descriptor, errors } = parse(code, { filename });
      
      if (errors.length) {
        throw new Error(errors[0].message);
      }
      
      cache.set(filename, descriptor);
      
      // 生成主模块代码
      let output = '';
      
      // 处理 script 部分
      if (descriptor.script || descriptor.scriptSetup) {
        const scriptResult = compileScript(descriptor, {
          id: filename,
          ...options.script
        });
        output += scriptResult.content;
      }
      
      // 导入 template
      if (descriptor.template) {
        output += `\nimport { render } from "${filename}?vue&type=template&id=${id}";`;
        output += `\n__script.render = render;`;
      }
      
      // 导入 styles
      descriptor.styles.forEach((style, index) => {
        output += `\nimport "${filename}?vue&type=style&index=${index}&id=${id}";`;
      });
      
      output += `\nexport default __script;`;
      
      return {
        code: output,
        map: null
      };
    },
    
    handleHotUpdate(ctx) {
      const { file, read, server } = ctx;
      
      if (!file.endsWith('.vue')) return;
      
      const prevDescriptor = cache.get(file);
      const content = read();
      const { descriptor } = parse(content, { filename: file });
      
      cache.set(file, descriptor);
      
      const updates = [];
      
      // 检查 script 变化
      if (!isEqual(descriptor.script, prevDescriptor?.script)) {
        updates.push({
          type: 'js-update',
          path: file,
          acceptedPath: file,
          timestamp: Date.now()
        });
      }
      
      // 检查 template 变化
      if (!isEqual(descriptor.template, prevDescriptor?.template)) {
        updates.push({
          type: 'js-update',
          path: `${file}?vue&type=template`,
          acceptedPath: file,
          timestamp: Date.now()
        });
      }
      
      // 检查 style 变化
      descriptor.styles.forEach((style, index) => {
        const prevStyle = prevDescriptor?.styles[index];
        if (!isEqual(style, prevStyle)) {
          updates.push({
            type: 'css-update',
            path: `${file}?vue&type=style&index=${index}`,
            acceptedPath: file,
            timestamp: Date.now()
          });
        }
      });
      
      return updates;
    }
  };
}
```

**CSS 预处理器插件**:
```javascript
// CSS 预处理器插件实现
import sass from 'sass';
import less from 'less';
import stylus from 'stylus';

function cssPreprocessorPlugin() {
  return {
    name: 'vite:css-preprocessor',
    
    async transform(code, id) {
      // Sass/SCSS 处理
      if (id.endsWith('.scss') || id.endsWith('.sass')) {
        const result = sass.renderSync({
          data: code,
          file: id,
          includePaths: ['node_modules'],
          sourceMap: true
        });
        
        return {
          code: result.css.toString(),
          map: result.map?.toString()
        };
      }
      
      // Less 处理
      if (id.endsWith('.less')) {
        const result = await less.render(code, {
          filename: id,
          paths: ['node_modules'],
          sourceMap: {}
        });
        
        return {
          code: result.css,
          map: result.map
        };
      }
      
      // Stylus 处理
      if (id.endsWith('.styl')) {
        return new Promise((resolve, reject) => {
          stylus(code)
            .set('filename', id)
            .set('paths', ['node_modules'])
            .render((err, css) => {
              if (err) reject(err);
              else resolve({ code: css });
            });
        });
      }
    }
  };
}
```

## 生产构建

### Rollup 构建流程

**构建配置生成**:
```javascript
// 生产构建实现
import { rollup } from 'rollup';
import { resolve } from 'path';

class ViteBuilder {
  constructor(config) {
    this.config = config;
  }
  
  async build() {
    // 1. 生成 Rollup 配置
    const rollupConfig = await this.generateRollupConfig();
    
    // 2. 执行构建
    const bundle = await rollup(rollupConfig);
    
    // 3. 写入文件
    await bundle.write(rollupConfig.output);
    
    // 4. 生成构建报告
    return this.generateBuildReport(bundle);
  }
  
  async generateRollupConfig() {
    const { config } = this;
    
    return {
      input: config.build.rollupOptions.input || resolve(config.root, 'index.html'),
      
      plugins: [
        // HTML 入口处理
        htmlPlugin(),
        
        // 模块解析
        resolvePlugin({
          alias: config.resolve.alias,
          extensions: config.resolve.extensions
        }),
        
        // 代码转换
        ...config.plugins.filter(p => p.apply !== 'serve'),
        
        // 代码压缩
        config.build.minify && terserPlugin(),
        
        // CSS 提取
        cssPlugin({
          extract: true,
          minimize: config.build.minify
        })
      ],
      
      output: {
        dir: config.build.outDir,
        format: 'es',
        entryFileNames: config.build.rollupOptions.output?.entryFileNames || '[name].[hash].js',
        chunkFileNames: config.build.rollupOptions.output?.chunkFileNames || '[name].[hash].js',
        assetFileNames: config.build.rollupOptions.output?.assetFileNames || '[name].[hash].[ext]',
        
        // 代码分割
        manualChunks: this.generateManualChunks()
      },
      
      external: config.build.rollupOptions.external
    };
  }
  
  generateManualChunks() {
    return (id) => {
      // 第三方库分离
      if (id.includes('node_modules')) {
        // 大型库单独分包
        if (id.includes('vue')) return 'vue';
        if (id.includes('react')) return 'react';
        if (id.includes('lodash')) return 'lodash';
        
        // 其他第三方库
        return 'vendor';
      }
      
      // 按路由分包
      if (id.includes('/pages/')) {
        const match = id.match(/\/pages\/([^\/]+)/);
        if (match) return `page-${match[1]}`;
      }
      
      // 工具库分包
      if (id.includes('/utils/')) return 'utils';
    };
  }
}

// HTML 处理插件
function htmlPlugin() {
  return {
    name: 'vite:html',
    
    buildStart() {
      // 扫描 HTML 入口
      this.addWatchFile(resolve('index.html'));
    },
    
    resolveId(id) {
      if (id.endsWith('.html')) {
        return id;
      }
    },
    
    load(id) {
      if (id.endsWith('.html')) {
        return readFileSync(id, 'utf-8');
      }
    },
    
    transform(code, id) {
      if (id.endsWith('.html')) {
        // 处理 HTML 中的资源引用
        return this.transformHtml(code, id);
      }
    },
    
    transformHtml(html, id) {
      // 提取 script 和 link 标签
      const scripts = [];
      const links = [];
      
      html = html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (match, src) => {
        if (!src.startsWith('http')) {
          scripts.push(resolve(dirname(id), src));
          return ''; // 移除原标签
        }
        return match;
      });
      
      html = html.replace(/<link[^>]*href="([^"]+)"[^>]*>/g, (match, href) => {
        if (href.endsWith('.css')) {
          links.push(resolve(dirname(id), href));
          return ''; // 移除原标签
        }
        return match;
      });
      
      // 添加入口点
      scripts.forEach(script => {
        this.emitFile({
          type: 'chunk',
          id: script,
          isEntry: true
        });
      });
      
      links.forEach(link => {
        this.emitFile({
          type: 'asset',
          fileName: basename(link),
          source: readFileSync(link)
        });
      });
      
      return html;
    }
  };
}
```

### 构建优化策略

**代码分割优化**:
```javascript
// 智能代码分割
class ChunkOptimizer {
  constructor(config) {
    this.config = config;
    this.moduleGraph = new Map();
  }
  
  generateOptimalChunks() {
    return (id, { getModuleInfo, getModuleIds }) => {
      const moduleInfo = getModuleInfo(id);
      
      // 1. 第三方库优化
      if (id.includes('node_modules')) {
        return this.optimizeVendorChunks(id, moduleInfo);
      }
      
      // 2. 路由级别分割
      if (this.isRouteModule(id)) {
        return this.generateRouteChunk(id);
      }
      
      // 3. 共享模块优化
      if (this.isSharedModule(id, getModuleIds)) {
        return 'shared';
      }
      
      // 4. 懒加载模块
      if (this.isDynamicImport(moduleInfo)) {
        return this.generateDynamicChunk(id);
      }
    };
  }
  
  optimizeVendorChunks(id, moduleInfo) {
    // 大型库单独分包
    const largeLibraries = ['vue', 'react', 'angular', 'lodash', 'moment'];
    
    for (const lib of largeLibraries) {
      if (id.includes(lib)) {
        return lib;
      }
    }
    
    // UI 库分包
    const uiLibraries = ['element-ui', 'ant-design', 'vuetify'];
    for (const ui of uiLibraries) {
      if (id.includes(ui)) {
        return 'ui-lib';
      }
    }
    
    // 工具库分包
    const utilLibraries = ['axios', 'dayjs', 'crypto-js'];
    for (const util of utilLibraries) {
      if (id.includes(util)) {
        return 'utils-lib';
      }
    }
    
    // 其他第三方库
    return 'vendor';
  }
  
  isSharedModule(id, getModuleIds) {
    // 计算模块被引用次数
    let referenceCount = 0;
    
    for (const moduleId of getModuleIds()) {
      const info = getModuleInfo(moduleId);
      if (info.importedIds.includes(id)) {
        referenceCount++;
      }
    }
    
    // 被多个模块引用的作为共享模块
    return referenceCount >= 2;
  }
}

// 资源优化
class AssetOptimizer {
  constructor() {
    this.imageOptimizer = new ImageOptimizer();
    this.fontOptimizer = new FontOptimizer();
  }
  
  async optimizeAssets(assets) {
    const optimizedAssets = [];
    
    for (const asset of assets) {
      if (this.isImage(asset.fileName)) {
        const optimized = await this.imageOptimizer.optimize(asset);
        optimizedAssets.push(optimized);
      }
      else if (this.isFont(asset.fileName)) {
        const optimized = await this.fontOptimizer.optimize(asset);
        optimizedAssets.push(optimized);
      }
      else {
        optimizedAssets.push(asset);
      }
    }
    
    return optimizedAssets;
  }
}

// 构建分析
class BuildAnalyzer {
  generateReport(bundle) {
    const modules = [];
    const chunks = [];
    let totalSize = 0;
    
    // 分析模块
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (chunk.type === 'chunk') {
        chunks.push({
          fileName,
          size: chunk.code.length,
          modules: Object.keys(chunk.modules).length,
          isEntry: chunk.isEntry,
          isDynamicEntry: chunk.isDynamicEntry
        });
        
        // 分析模块详情
        for (const [moduleId, module] of Object.entries(chunk.modules)) {
          modules.push({
            id: moduleId,
            size: module.code?.length || 0,
            chunk: fileName
          });
        }
      }
      
      totalSize += chunk.code?.length || 0;
    }
    
    return {
      totalSize,
      chunks: chunks.sort((a, b) => b.size - a.size),
      modules: modules.sort((a, b) => b.size - a.size),
      recommendations: this.generateRecommendations(chunks, modules)
    };
  }
  
  generateRecommendations(chunks, modules) {
    const recommendations = [];
    
    // 检查大型 chunk
    const largeChunks = chunks.filter(chunk => chunk.size > 500 * 1024);
    if (largeChunks.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `发现 ${largeChunks.length} 个大型 chunk (>500KB)，建议进一步分割`
      });
    }
    
    // 检查重复模块
    const moduleGroups = {};
    modules.forEach(module => {
      const key = module.id;
      moduleGroups[key] = (moduleGroups[key] || 0) + 1;
    });
    
    const duplicates = Object.entries(moduleGroups)
      .filter(([, count]) => count > 1)
      .length;
    
    if (duplicates > 0) {
      recommendations.push({
        type: 'info',
        message: `发现 ${duplicates} 个重复模块，可以考虑提取为共享 chunk`
      });
    }
    
    return recommendations;
  }
}
```

## 性能优化

### 开发环境优化

```javascript
// 缓存优化
class ViteCache {
  constructor() {
    this.transformCache = new Map();
    this.dependencyCache = new Map();
    this.fileWatcher = null;
  }
  
  setupFileWatcher() {
    this.fileWatcher = chokidar.watch('.', {
      ignored: ['node_modules', '.git', 'dist']
    });
    
    this.fileWatcher.on('change', (filePath) => {
      // 清除相关缓存
      this.invalidateCache(filePath);
    });
  }
  
  getCachedTransform(id, code, transform) {
    const cacheKey = `${id}:${this.getCodeHash(code)}`;
    
    if (this.transformCache.has(cacheKey)) {
      return this.transformCache.get(cacheKey);
    }
    
    const result = transform(code, id);
    this.transformCache.set(cacheKey, result);
    
    return result;
  }
  
  invalidateCache(filePath) {
    // 清除直接相关的缓存
    for (const [key] of this.transformCache) {
      if (key.startsWith(filePath)) {
        this.transformCache.delete(key);
      }
    }
    
    // 清除依赖相关的缓存
    const dependents = this.getDependents(filePath);
    dependents.forEach(dep => {
      this.invalidateCache(dep);
    });
  }
}

// 预加载优化
class ModulePreloader {
  constructor(server) {
    this.server = server;
    this.preloadQueue = new Set();
  }
  
  async preloadDependencies(entryModule) {
    const dependencies = await this.analyzeDependencies(entryModule);
    
    // 按优先级预加载
    const criticalDeps = dependencies.filter(dep => dep.critical);
    const normalDeps = dependencies.filter(dep => !dep.critical);
    
    // 并行预加载关键依赖
    await Promise.all(
      criticalDeps.map(dep => this.preloadModule(dep.id))
    );
    
    // 后台预加载普通依赖
    this.backgroundPreload(normalDeps);
  }
  
  async preloadModule(moduleId) {
    if (this.preloadQueue.has(moduleId)) return;
    
    this.preloadQueue.add(moduleId);
    
    try {
      await this.server.transformModule(moduleId);
    } catch (error) {
      console.warn(`Failed to preload ${moduleId}:`, error);
    }
  }
  
  backgroundPreload(modules) {
    // 使用 requestIdleCallback 在空闲时预加载
    const preloadNext = () => {
      if (modules.length === 0) return;
      
      const module = modules.shift();
      this.preloadModule(module.id).then(() => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(preloadNext);
        } else {
          setTimeout(preloadNext, 0);
        }
      });
    };
    
    preloadNext();
  }
}
```

### 生产环境优化

```javascript
// 构建优化配置
export default defineConfig({
  build: {
    // 目标环境
    target: 'es2015',
    
    // 输出目录
    outDir: 'dist',
    
    // 资源内联阈值
    assetsInlineLimit: 4096,
    
    // CSS 代码分割
    cssCodeSplit: true,
    
    // 生成 sourcemap
    sourcemap: false,
    
    // 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
          // 框架代码
          vue: ['vue', 'vue-router', 'vuex'],
          
          // UI 库
          'element-ui': ['element-ui'],
          
          // 工具库
          utils: ['lodash', 'dayjs', 'axios']
        }
      }
    },
    
    // 实验性功能
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `window.__assetsPath(${JSON.stringify(filename)})` };
        } else {
          return { relative: true };
        }
      }
    }
  },
  
  // 优化选项
  optimizeDeps: {
    // 强制预构建
    include: ['vue', 'vue-router'],
    
    // 排除预构建
    exclude: ['your-local-package'],
    
    // esbuild 选项
    esbuildOptions: {
      target: 'es2015'
    }
  }
});
```

## 总结

### Vite 核心优势

**开发体验**:
- **快速冷启动**: 基于 ESM，无需打包
- **即时热更新**: 精确的 HMR 实现
- **简单配置**: 约定优于配置

**性能优势**:
- **esbuild 预构建**: 依赖预处理速度快
- **按需编译**: 只编译访问的模块
- **智能缓存**: 多层缓存机制

**生态兼容**:
- **Rollup 插件**: 兼容 Rollup 生态
- **框架无关**: 支持多种前端框架
- **现代标准**: 基于 Web 标准

### 最佳实践建议

1. **合理使用插件**: 选择官方和社区成熟插件
2. **优化依赖**: 合理配置 optimizeDeps
3. **代码分割**: 利用动态导入和手动分包
4. **缓存策略**: 充分利用浏览器和构建缓存
5. **监控分析**: 使用构建分析工具优化包体积

Vite 代表了现代前端构建工具的发展方向，其基于 ESM 的设计理念和优秀的开发体验使其成为新项目的首选构建工具。