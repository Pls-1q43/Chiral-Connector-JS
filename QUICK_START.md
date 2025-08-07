# 🚀 Chiral JS 客户端快速上手

> 3分钟将您的静态博客接入 Chiral 网络！

## 第一步：下载文件

从 `dist/` 目录下载：
- `chiral-client.min.js` (~25KB，生产版本)
- `chiral-client.min.css` (~3KB，样式文件)

或者直接使用 CDN：
```html
<!-- CDN 方式 -->
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.min.css">
<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.min.js"></script>
```

## 第二步：基础配置

```html
<!-- 1. 引入样式 -->
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<!-- 2. 配置参数 (简化配置，只需Hub地址) -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com'    // 替换为您的Hub地址
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
     data-hub-url="https://your-hub.com">
    Loading related Chiral data...
</div>
```

## 平台快速集成

### Hugo
```html
<!-- layouts/partials/chiral-related.html -->
{{ if .Site.Params.chiral.enable }}
<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-hub-url="{{ .Site.Params.chiral.hubUrl }}"
     data-count="{{ .Site.Params.chiral.count | default 5 }}">
    Loading related Chiral data...
</div>
{{ end }}
```

### Jekyll
```html
<!-- _includes/chiral-related.html -->
{% if site.chiral.enable %}
<div id="chiral-connector-related-posts" 
     data-post-url="{{ page.url | absolute_url }}"
     data-hub-url="{{ site.chiral.hubUrl }}"
     data-count="{{ site.chiral.count | default: 5 }}">
    Loading related Chiral data...
</div>
{% endif %}
```

### Hexo
```html
<!-- themes/[theme]/_partial/chiral-related.ejs -->
<% if (theme.chiral && theme.chiral.enable) { %>
<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-hub-url="<%= theme.chiral.hubUrl %>"
     data-count="<%= theme.chiral.count || 5 %>">
    Loading related Chiral data...
</div>
<% } %>
```

### VuePress
```vue
<!-- .vuepress/components/ChiralRelated.vue -->
<template>
  <div id="chiral-connector-related-posts" 
       :data-post-url="fullUrl"
       :data-hub-url="hubUrl">
    Loading related Chiral data...
  </div>
</template>

<script>
export default {
  data() {
    return {
      hubUrl: 'https://your-hub.com'
    };
  },
  computed: {
    fullUrl() {
      return this.$site.base + this.$page.path;
    }
  }
};
</script>
```

## 常用配置

```javascript
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',          // 必需：Hub地址
    display: {
        count: 5,                            // 显示数量 (1-20)
        showThumbnails: true,                // 显示缩略图
        showExcerpts: true,                  // 显示摘要
        enableCache: true,                   // 启用缓存
        cacheTTL: 3600                       // 缓存时间(秒)
    },
    i18n: {
        locale: 'zh-CN'                      // 语言：en/zh-CN/zh-TW/ja
    }
};
```

## 调试命令

```javascript
// 浏览器控制台中使用
window.chiralClientInstance.getInfo()        // 查看客户端状态
window.chiralClientInstance.testConnection() // 测试Hub连接
window.chiralClientInstance.clearCache()     // 清除缓存
window.chiralClientInstance.getCacheStats()  // 查看缓存统计

// 启用详细日志
localStorage.setItem('chiral_debug', 'true');
```

## 工作原理

1. **RSS自动抓取**：Hub端自动抓取您的博客RSS，无需手动同步
2. **智能匹配**：基于域名自动识别站点身份，无需配置Node ID
3. **混合架构**：直接调用WordPress.com API + Hub代理，提升性能
4. **智能缓存**：自动缓存相关文章数据，减少API调用

---

📖 **详细文档**：查看 `USAGE_GUIDE.md` 获取完整使用说明  
🔧 **故障排除**：检查Hub地址是否正确，确保您的博客已被Hub收录  
💬 **获取帮助**：[GitHub Issues](https://github.com/your-org/chiral-connector-js/issues) 或联系技术支持 