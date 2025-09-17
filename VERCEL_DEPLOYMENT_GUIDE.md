# 🚀 Vercel 部署和域名绑定指南

## 📋 部署前检查清单

- [x] 项目已配置 `vercel.json`
- [x] 优化了 `next.config.ts`
- [ ] 代码已推送到 GitHub
- [ ] 腾讯云域名已购买

## 🔧 第一步：推送代码到 GitHub

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Add Vercel deployment configuration"

# 推送到 GitHub
git push origin main
```

## 🌐 第二步：部署到 Vercel

### 方法一：使用 Vercel CLI（推荐）

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 在项目根目录执行部署
cd codepoet
vercel

# 按照提示操作：
# 1. 登录 Vercel 账号
# 2. 选择项目设置
# 3. 确认部署
```

### 方法二：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 `codepoet` 仓库
5. 保持默认设置，点击 "Deploy"

## 🔗 第三步：配置腾讯云 DNS

### 在腾讯云控制台：

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 "域名注册" → "我的域名"
3. 找到你的域名，点击 "解析"
4. 添加以下 DNS 记录：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| A | @ | 76.76.19.19 | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

### 可选：添加子域名
如果你想要 `blog.yourdomain.com` 这样的子域名：

| 记录类型 | 主机记录 | 记录值 | TTL |
|---------|---------|--------|-----|
| CNAME | blog | cname.vercel-dns.com | 600 |

## 🎯 第四步：在 Vercel 绑定域名

1. 在 Vercel 项目面板中，点击 "Settings"
2. 选择左侧的 "Domains"
3. 点击 "Add Domain"
4. 输入你的域名（例如：`yourdomain.com`）
5. 再次添加 `www.yourdomain.com`
6. Vercel 会自动验证并配置 SSL 证书

## ✅ 验证部署

### 检查部署状态：
- 在 Vercel 面板查看部署日志
- 访问 Vercel 提供的临时域名测试

### 检查域名解析：
```bash
# 检查 DNS 解析是否生效
nslookup yourdomain.com
dig yourdomain.com
```

### 测试访问：
- `https://yourdomain.com`
- `https://www.yourdomain.com`

## 🔧 常见问题解决

### 1. DNS 解析未生效
- 等待 10-30 分钟让 DNS 传播
- 清除浏览器缓存
- 使用 `dig` 命令检查解析

### 2. SSL 证书问题
- Vercel 会自动配置 Let's Encrypt 证书
- 通常需要几分钟时间生效

### 3. 构建失败
- 检查 `package.json` 中的构建脚本
- 查看 Vercel 部署日志中的错误信息

## 🚀 部署后优化

### 1. 设置环境变量（如需要）
在 Vercel 项目设置中添加环境变量

### 2. 配置分析工具
```bash
# 安装 Vercel Analytics
npm install @vercel/analytics
```

### 3. 性能监控
- 启用 Vercel Speed Insights
- 配置 Web Vitals 监控

## 📞 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel 官方文档
2. 检查腾讯云 DNS 设置
3. 联系技术支持

---

**预计完成时间：** 15-30 分钟  
**DNS 生效时间：** 10-30 分钟  
**SSL 证书生效：** 5-10 分钟