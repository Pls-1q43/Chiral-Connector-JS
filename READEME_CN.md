# Chiral Network JS 客户端使用指南

> 📖 **面向静态博客博主**：如何使用 Chiral JS 客户端加入 Chiral 网络

## 🎯 什么是 Chiral Network JS 客户端？

Chiral JS 客户端是一个专为静态博客设计的轻量级 JavaScript 库，让您的静态站点（Hugo、Jekyll、Hexo、VuePress 等）能够显示来自 Chiral 网络的相关文章，实现跨站的相关文章推荐，打破信息孤岛。
采用创新的混合架构，无需复杂配置，只需一个 Hub 地址即可接入整个 Chiral 内容生态。

## 📋 前提条件

在开始之前，您需要：

1. **一个静态博客站点**（Hugo、Jekyll、Hexo、VuePress 等）
2. **加入 Chiral 网络**：您需要先在一个已经建立的 Chiral Network Hub 上注册。
3. **获得 Hub 地址**：
   - `Hub URL`：您所加入的 Chiral Hub 地址

> 💡 **如何加入 Chiral 网络？**  
> 在 Chiral Hub 上注册，填写您的博客 RSS 地址，Sitemap，完成首次同步后，RSS 会自动抓取。

## 🚀 快速开始（1分钟接入）

### 只需添加3行代码！

1. **下载文件**：从项目的 `dist/` 目录下载 `chiral-client.min.js` 和 `chiral-client.min.css`
2. **复制粘贴**：在您的**单篇文章模板**中添加以下代码：

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<!-- 相关文章容器 -->
<div id="chiral-related-posts">Loading related Chiral data...</div>

<!-- 引入客户端（配置参数） -->
<script src="/assets/chiral-client.min.js" 
        data-container="chiral-related-posts" 
        data-hub-url="https://your-hub.com" 
        data-count="5" 
        data-auto-init="true"></script>
```

**参数说明**：
- `data-hub-url`：替换为您的 Chiral Hub 地址
- `data-count`：显示文章数量（可选，默认5篇）
- `data-container`：容器ID（必须与div的id匹配）

🎉 **完成！** 访问文章页面即可看到相关文章。无需配置文件，无需复杂设置！

## ⚙️ 详细配置选项

### 基础配置

```javascript
window.ChiralConfig = {
    // 【必需】Hub 地址 (唯一必需配置)
    hubUrl: 'https://hub.example.com',
    
    // 【可选】显示设置
    display: {
        count: 5,                    // 显示文章数量（1-20）
        enableCache: true,           // 启用缓存
        cacheTTL: 3600,             // 缓存时间（秒）
        showThumbnails: true,        // 显示缩略图
        showExcerpts: true          // 显示摘要
    },
    
    // 【可选】语言设置
    i18n: {
        locale: 'zh-CN',            // 界面语言：en, zh-CN, zh-TW, ja
        customMessages: {}           // 自定义翻译
    }
};
```

### 容器属性配置

```html
<div id="chiral-connector-related-posts" 
     data-post-url="https://blog.com/post-title"    <!-- 当前文章URL -->
     data-hub-url="https://hub.example.com"         <!-- Hub地址 -->
     data-count="5">                                <!-- 显示数量 -->
    Loading related Chiral data...
</div>
```

## 🔧 各平台集成方法

### Hugo 集成（已验证✔）

#### 方法一：全局配置

在 `hugo.toml` 中添加：

```toml
[params]
  [params.chiral]
    enable = true
    hubUrl = "https://yourhub.com"
    count = 5
```

创建 `layouts/partials/chiral-related.html`：

```html
{{ if .Site.Params.chiral.enable }}
{{- $chiralCSS := resources.Get "chiral-client.min.css" -}}
{{- $chiralJS := resources.Get "chiral-client.min.js" -}}

<link rel="stylesheet" href="{{ $chiralCSS.RelPermalink }}">

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-hub-url="{{ .Site.Params.chiral.hubUrl }}"
     data-count="{{ .Site.Params.chiral.count | default 5 }}">
    Loading related Chiral data...
</div>

<!-- 使用 data 属性方式初始化 -->
<script src="{{ $chiralJS.RelPermalink }}" 
        data-container="chiral-connector-related-posts" 
        data-hub-url="{{ .Site.Params.chiral.hubUrl }}" 
        data-count="{{ .Site.Params.chiral.count | default 5 }}" 
        data-auto-init="true"></script>
{{ end }}
```

在单篇文章模板(single.html)中调用：

```html
{{ partial "chiral-related.html" . }}
```

#### 方法二：直接在模板中使用

在 `layouts/_default/single.html` 中添加：

```html
<!-- 文章内容后 -->
{{ .Content }}

<!-- Chiral 相关文章 -->
<link rel="stylesheet" href="{{ "/assets/chiral-client.min.css" | relURL }}">

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}">
    Loading related Chiral data...
</div>

<!-- 使用 data 属性方式初始化 -->
<script src="{{ "/assets/chiral-client.min.js" | relURL }}" 
        data-container="chiral-connector-related-posts" 
        data-hub-url="https://your-hub.com" 
        data-count="5" 
        data-auto-init="true"></script>
```

### Jekyll 集成(未验证)

在 `_config.yml` 中添加：

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  count: 5
```

创建 `_includes/chiral-related.html`：

```html
{% if site.chiral.enable %}
<link rel="stylesheet" href="{{ '/assets/chiral-client.min.css' | relative_url }}">

<script>
window.ChiralConfig = {
    hubUrl: '{{ site.chiral.hubUrl }}',
    display: {
        count: {{ site.chiral.count | default: 5 }}
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="{{ page.url | absolute_url }}"
     data-hub-url="{{ site.chiral.hubUrl }}">
    Loading related Chiral data...
</div>

<script src="{{ '/assets/chiral-client.min.js' | relative_url }}"></script>
{% endif %}
```

在文章布局中调用：

```html
<!-- _layouts/post.html -->
{{ content }}

{% include chiral-related.html %}
```

### Hexo 集成（已验证✔）

在主题的 `layout/_partial/` 目录创建 `chiral-related.ejs`：

```html
<% if (theme.chiral && theme.chiral.enable) { %>
<link rel="stylesheet" href="<%- url_for('/assets/chiral-client.min.css') %>">

<script>
window.ChiralConfig = {
    hubUrl: '<%= theme.chiral.hubUrl %>',
    display: {
        count: <%= theme.chiral.count || 5 %>
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-hub-url="<%= theme.chiral.hubUrl %>">
    Loading related Chiral data...
</div>

<script src="<%- url_for('/assets/chiral-client.min.js') %>"></script>
<% } %>
```

在主题配置 `_config.yml` 中：

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  count: 5
```

在文章模板中引入：

```html
<!-- layout/post.ejs -->
<%- partial('_partial/chiral-related') %>
```

### VuePress 集成（未验证）

创建 `.vuepress/components/ChiralRelated.vue`：

```vue
<template>
  <div>
    <div id="chiral-connector-related-posts" 
         :data-post-url="fullUrl"
         :data-hub-url="hubUrl">
      Loading related Chiral data...
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChiralRelated',
  
  data() {
    return {
      hubUrl: 'https://your-hub.com'
    };
  },
  
  mounted() {
    // 动态加载 CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/chiral-client.min.css';
    document.head.appendChild(css);
    
    // 配置客户端
    window.ChiralConfig = {
      hubUrl: this.hubUrl
    };
    
    // 动态加载 JS
    const script = document.createElement('script');
    script.src = '/assets/chiral-client.min.js';
    document.body.appendChild(script);
  }
};
</script>
```

在文章中使用：

```markdown
# 我的文章

文章内容...

<ChiralRelated />
```

## 🎨 样式自定义

### 基础样式覆盖

```css
/* 自定义相关文章标题 */
.chiral-connector-related-posts-list h3 {
    color: #your-color;
    font-size: 1.5em;
}

/* 自定义文章项样式 */
.chiral-connector-related-posts-list li {
    border-left: 3px solid #your-accent-color;
    padding-left: 15px;
}

/* 自定义缩略图 */
.related-post-thumbnail img {
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.related-post-thumbnail img:hover {
    transform: scale(1.05);
}
```

### 暗色模式适配

客户端内置暗色模式支持，也可以手动覆盖：

```css
@media (prefers-color-scheme: dark) {
    .chiral-connector-related-posts-container {
        background: #1a1a1a;
        color: #e0e0e0;
    }
    
    .chiral-connector-related-posts-list a {
        color: #4a9eff;
    }
}
```

## 🔍 故障排除

### 常见问题

**Q: 显示"Page data not found in Chiral network"**
- **原因**：您的博客文章尚未被 Hub 的 RSS 爬虫抓取
- **解决**：等待 Hub 抓取，或联系 Hub 管理员手动触发抓取

**Q: 显示"Chiral Client configuration error"**
- **原因**：配置参数错误
- **解决**：检查 `hubUrl` 是否正确且可访问

**Q: 控制台出现网络错误**
- **原因**：Hub 地址不可访问或网络问题
- **解决**：确认 Hub 地址正确，检查网络连接

**Q: 样式显示异常**
- **原因**：CSS 文件未正确加载或被其他样式覆盖
- **解决**：确认 CSS 文件路径，调整样式优先级

### 调试工具

打开浏览器开发者工具，在控制台输入：

```javascript
// 查看客户端信息
window.chiralClientInstance.getInfo()

// 查看缓存统计
window.chiralClientInstance.getCacheStats()

// 测试连接
window.chiralClientInstance.testConnection()

// 清除缓存
window.chiralClientInstance.clearCache()
```

### 日志查看

客户端会在控制台输出详细日志：

```javascript
// 启用详细日志
localStorage.setItem('chiral_debug', 'true');

// 禁用日志
localStorage.removeItem('chiral_debug');
```

## 📊 性能优化

### 缓存设置

```javascript
window.ChiralConfig = {
    display: {
        enableCache: true,
        cacheTTL: 43200  // 12小时缓存，减少API调用
    }
};
```

### 懒加载

仅在需要时加载客户端：

```javascript
// 检查是否为文章页面
if (document.getElementById('chiral-connector-related-posts')) {
    // 动态加载客户端
    const script = document.createElement('script');
    script.src = '/assets/chiral-client.min.js';
    document.body.appendChild(script);
}
```

---

## 🚀 高级特性

### 编程式 API

除了自动初始化，您还可以通过编程方式使用客户端：

```javascript
// 手动初始化客户端
const client = ChiralClient.init({
    hubUrl: 'https://your-hub.com'
});

// 获取特定 URL 的相关文章
client.getRelatedPosts('https://blog.com/post', 5)
    .then(posts => console.log('Related posts:', posts));

// 测试连接
client.testConnection()
    .then(connected => console.log('Connected:', connected));
```

### 事件监听

```javascript
// 监听客户端就绪事件
window.addEventListener('chiralClientReady', function(event) {
    console.log('Chiral Client ready:', event.detail);
});

// 监听数据加载完成事件
window.addEventListener('chiralDataLoaded', function(event) {
    console.log('Posts loaded:', event.detail.posts.length);
});
```

### 缓存管理

```javascript
// 获取缓存统计
const stats = window.chiralClientInstance.getCacheStats();
console.log('Cache stats:', stats);

// 清理过期缓存
const cleaned = window.chiralClientInstance.cleanExpiredCache();
console.log('Cleaned items:', cleaned);
```

---

🎉 **恭喜！** 您已经成功将博客接入 Chiral 网络。现在您的读者可以发现更多相关的优质内容了！ 