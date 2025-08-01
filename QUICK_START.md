# 🚀 Chiral JS 客户端快速上手

> 3分钟将您的静态博客接入 Chiral 网络！

## 第一步：下载文件

从 `dist/` 目录下载：
- `chiral-client.min.js` (22KB)
- `chiral-client.min.css` (2KB)

## 第二步：基础配置

```html
<!-- 1. 引入样式 -->
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<!-- 2. 配置参数 -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',    // 替换为您的Hub地址
    nodeId: 'your-blog-id'             // 替换为您的Node ID
};
</script>

<!-- 3. 引入客户端 -->
<script src="/assets/chiral-client.min.js"></script>
```

## 第三步：添加容器

在文章页面中添加：

```html
<div id="chiral-connector-related-posts" 
     data-post-url="当前文章完整URL"
     data-node-id="your-blog-id"
     data-hub-url="https://your-hub.com">
    Loading...
</div>
```

## 平台快速集成

### Hugo
```html
<!-- layouts/partials/chiral.html -->
<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-node-id="your-hugo-blog"
     data-hub-url="https://your-hub.com">
</div>
```

### Jekyll
```html
<!-- _includes/chiral.html -->
<div id="chiral-connector-related-posts" 
     data-post-url="{{ page.url | absolute_url }}"
     data-node-id="your-jekyll-blog"
     data-hub-url="https://your-hub.com">
</div>
```

### Hexo
```html
<!-- _partial/chiral.ejs -->
<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-node-id="your-hexo-blog"
     data-hub-url="https://your-hub.com">
</div>
```

## 常用配置

```javascript
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',
    nodeId: 'your-blog',
    display: {
        count: 5,                    // 显示数量
        showThumbnails: true,        // 显示缩略图
        showExcerpts: true          // 显示摘要
    },
    i18n: {
        locale: 'zh-CN'             // 语言：en/zh-CN/zh-TW/ja
    }
};
```

## 调试命令

```javascript
// 浏览器控制台中使用
window.chiralClientInstance.getInfo()        // 查看状态
window.chiralClientInstance.testConnection() // 测试连接
window.chiralClientInstance.clearCache()     // 清除缓存
```

---

📖 **详细文档**：查看 `USAGE_GUIDE.md` 获取完整使用说明
🔧 **故障排除**：检查Hub地址和Node ID是否正确
💬 **获取帮助**：提交 GitHub Issues 或联系技术支持 