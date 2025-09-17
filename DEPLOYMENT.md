# CodePoet 部署指南

## 使用 Vercel + 自定义域名 + Cloudflare 部署指南

### 前置准备

- ✅ CodePoet 代码已完成
- ⬜ GitHub 账号
- ⬜ Vercel 账号  
- ⬜ 已购买的域名
- ⬜ Cloudflare 账号

### 第一步：推送代码到 GitHub

```bash
# 1. 在 GitHub 创建新仓库 (例如: codepoet)
# 2. 添加远程仓库
git remote add origin https://github.com/SinzoL/codepoet.git

# 3. 推送代码
git branch -M main
git push -u origin main
```

### 第二步：在 Vercel 部署

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库 `codepoet`
   - 点击 "Import"

3. **配置项目**
   ```
   Project Name: codepoet
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获得 Vercel 提供的域名 (例如: codepoet.vercel.app)

### 第三步：配置自定义域名

#### 在 Vercel 中添加域名

1. 进入项目设置 → Domains
2. 添加你的域名 (例如: codepoet.com)
3. 选择配置方式：
   - **推荐**: 使用 Vercel 的 DNS
   - **高级**: 使用外部 DNS (Cloudflare)

#### 方案一：使用 Vercel DNS (简单)

1. 在域名注册商处修改 NS 记录指向 Vercel
2. Vercel 会自动配置 SSL 证书
3. 完成！

#### 方案二：使用 Cloudflare DNS (推荐)

### 第四步：配置 Cloudflare

1. **添加网站到 Cloudflare**
   - 登录 Cloudflare
   - 点击 "Add a Site"
   - 输入你的域名
   - 选择免费计划

2. **配置 DNS 记录**
   ```
   类型: CNAME
   名称: @ (或 www)
   目标: codepoet.vercel.app
   代理状态: 已代理 (橙色云朵)
   ```

3. **更新域名服务器**
   - 在域名注册商处修改 NS 记录
   - 指向 Cloudflare 提供的 NS 服务器

4. **SSL/TLS 配置**
   - SSL/TLS → 概述 → 加密模式选择 "完全"
   - SSL/TLS → 边缘证书 → 启用 "始终使用 HTTPS"

### 第五步：优化配置

#### Cloudflare 性能优化

1. **缓存配置**
   ```
   缓存 → 配置 → 缓存级别: 标准
   缓存 → 页面规则: 
   - *.codepoet.com/* → 缓存级别: 缓存所有内容
   ```

2. **速度优化**
   ```
   速度 → 优化 → Auto Minify: 
   - ✅ JavaScript
   - ✅ CSS  
   - ✅ HTML
   ```

3. **安全设置**
   ```
   安全性 → WAF → 安全级别: 中等
   安全性 → Bot Fight Mode: 开启
   ```

#### Vercel 环境变量 (如需要)

```bash
# 在 Vercel 项目设置 → Environment Variables 中添加
NEXT_PUBLIC_SITE_URL=https://codepoet.com
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### 第六步：验证部署

1. **检查域名访问**
   - 访问 https://你的域名.com
   - 确认网站正常加载

2. **检查 SSL 证书**
   - 浏览器地址栏显示锁图标
   - 证书有效期正常

3. **性能测试**
   - 使用 [PageSpeed Insights](https://pagespeed.web.dev/)
   - 使用 [GTmetrix](https://gtmetrix.com/)

### 第七步：持续部署

配置完成后，每次推送代码到 GitHub main 分支，Vercel 会自动：

1. 拉取最新代码
2. 构建项目
3. 部署到生产环境
4. 通过 Cloudflare CDN 分发

### 故障排除

#### 常见问题

1. **域名解析失败**
   - 检查 DNS 记录配置
   - 等待 DNS 传播 (最多 48 小时)

2. **SSL 证书错误**
   - 确认 Cloudflare SSL 模式为 "完全"
   - 检查 Vercel 域名配置

3. **构建失败**
   - 检查 package.json 依赖
   - 查看 Vercel 构建日志

4. **页面 404 错误**
   - 确认文件路径正确
   - 检查 Next.js 路由配置

### 监控和维护

1. **设置监控**
   - Vercel Analytics
   - Google Analytics
   - Cloudflare Analytics

2. **定期更新**
   - 依赖包更新
   - 安全补丁
   - 内容更新

3. **备份策略**
   - GitHub 代码备份
   - 定期导出文章内容

---

🎉 恭喜！你的 CodePoet 博客现在已经成功部署到全球 CDN，拥有了专业的域名和 SSL 证书！

> "让诗意的代码飞向云端，在全世界传播技术与美的结合。"