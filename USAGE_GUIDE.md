# Chiral Network JS 客户端使用指南

> 📖 **面向静态博客博主**：如何使用 Chiral JS 客户端加入 Chiral 网络

## 🎯 什么是 Chiral Network JS 客户端？

Chiral JS 客户端是一个轻量级的 JavaScript 库，让您的静态博客（Hugo、Jekyll、Hexo 等）能够显示来自 Chiral 网络的相关文章。无需复杂配置，只需几行代码即可接入整个 Chiral 内容生态。

## 📋 前提条件

在开始之前，您需要：

1. **一个静态博客站点**（Hugo、Jekyll、Hexo、VuePress 等）
2. **加入 Chiral 网络**：您的博客需要先被 Chiral Hub 收录
3. **获得配置信息**：
   - `Hub URL`：您所加入的 Chiral Hub 地址
   - `Node ID`：您的博客在该 Hub 中的标识

> 💡 **如何加入 Chiral 网络？**  
> 联系 Chiral Hub 的管理员，提供您的博客 RSS 地址，管理员会为您分配 Node ID。

## 🚀 快速开始（3分钟接入）

### 步骤 1：下载客户端文件

从项目的 `dist/` 目录下载这两个文件：
- `chiral-client.min.js` （22KB，生产版本）
- `chiral-client.min.css` （2KB，样式文件）

### 步骤 2：在网站中引入文件

在您网站的**单篇文章模板**中添加以下代码：

```html
<!-- 引入 CSS 样式 -->
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<!-- 配置 Chiral 客户端 -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',      // 替换为您的 Hub 地址
    nodeId: 'your-blog-id'               // 替换为您的 Node ID
};
</script>

<!-- 引入 JS 客户端 -->
<script src="/assets/chiral-client.min.js"></script>
```

### 步骤 3：在文章页面添加显示容器

在您网站**单篇文章模板**希望显示相关文章的位置添加：

```html
<div id="chiral-connector-related-posts" 
     data-post-url="当前文章的完整URL"
     data-node-id="your-blog-id"
     data-hub-url="https://your-hub.com">
    加载中的相关 Chiral 数据...
</div>
```

🎉 **完成！** 现在访问您的文章页面，就能看到来自 Chiral 网络的相关文章了。

## ⚙️ 详细配置选项

### 基础配置

```javascript
window.ChiralConfig = {
    // 【必需】Hub 地址
    hubUrl: 'https://hub.example.com',
    
    // 【必需】您的博客 Node ID  
    nodeId: 'my-blog',
    
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
     data-node-id="my-blog"                         <!-- 博客Node ID -->
     data-hub-url="https://hub.example.com"         <!-- Hub地址 -->
     data-count="5">                                <!-- 显示数量 -->
    Loading...
</div>
```

## 🔧 各平台集成方法

### Hugo 集成

#### 方法一：全局配置

在 `config.yaml` 中添加：

```yaml
params:
  chiral:
    enable: true
    hubUrl: "https://your-hub.com"
    nodeId: "your-hugo-blog"
    count: 5
```

创建 `layouts/partials/chiral-related.html`：

```html
{{ if .Site.Params.chiral.enable }}
<link rel="stylesheet" href="{{ "/assets/chiral-client.min.css" | relURL }}">

<script>
window.ChiralConfig = {
    hubUrl: '{{ .Site.Params.chiral.hubUrl }}',
    nodeId: '{{ .Site.Params.chiral.nodeId }}',
    display: {
        count: {{ .Site.Params.chiral.count | default 5 }}
    },
    i18n: {
        locale: '{{ .Site.Language.Lang | default "en" }}'
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-node-id="{{ .Site.Params.chiral.nodeId }}"
     data-hub-url="{{ .Site.Params.chiral.hubUrl }}">
    Loading related Chiral data...
</div>

<script src="{{ "/assets/chiral-client.min.js" | relURL }}"></script>
{{ end }}
```

在单篇文章模板中调用：

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
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',
    nodeId: 'your-hugo-blog'
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-node-id="your-hugo-blog"
     data-hub-url="https://your-hub.com">
    Loading related Chiral data...
</div>

<script src="{{ "/assets/chiral-client.min.js" | relURL }}"></script>
```

### Jekyll 集成

在 `_config.yml` 中添加：

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  nodeId: "your-jekyll-blog"
  count: 5
```

创建 `_includes/chiral-related.html`：

```html
{% if site.chiral.enable %}
<link rel="stylesheet" href="{{ '/assets/chiral-client.min.css' | relative_url }}">

<script>
window.ChiralConfig = {
    hubUrl: '{{ site.chiral.hubUrl }}',
    nodeId: '{{ site.chiral.nodeId }}',
    display: {
        count: {{ site.chiral.count | default: 5 }}
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="{{ page.url | absolute_url }}"
     data-node-id="{{ site.chiral.nodeId }}"
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

### Hexo 集成

在主题的 `layout/_partial/` 目录创建 `chiral-related.ejs`：

```html
<% if (theme.chiral && theme.chiral.enable) { %>
<link rel="stylesheet" href="<%- url_for('/assets/chiral-client.min.css') %>">

<script>
window.ChiralConfig = {
    hubUrl: '<%= theme.chiral.hubUrl %>',
    nodeId: '<%= theme.chiral.nodeId %>',
    display: {
        count: <%= theme.chiral.count || 5 %>
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-node-id="<%= theme.chiral.nodeId %>"
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
  nodeId: "your-hexo-blog"
  count: 5
```

在文章模板中引入：

```html
<!-- layout/post.ejs -->
<%- partial('_partial/chiral-related') %>
```

### VuePress 集成

创建 `.vuepress/components/ChiralRelated.vue`：

```vue
<template>
  <div>
    <div id="chiral-connector-related-posts" 
         :data-post-url="$page.path"
         :data-node-id="nodeId"
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
      hubUrl: 'https://your-hub.com',
      nodeId: 'your-vuepress-blog'
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
      hubUrl: this.hubUrl,
      nodeId: this.nodeId
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
- **解决**：检查 `hubUrl` 和 `nodeId` 是否正确

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

### CDN 加速

使用 CDN 托管客户端文件：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/your-repo/dist/chiral-client.min.css">
<script src="https://cdn.jsdelivr.net/gh/your-repo/dist/chiral-client.min.js"></script>
```

## 📞 获取帮助

- **GitHub Issues**：报告问题和建议
- **文档站点**：详细技术文档
- **社区讨论**：与其他博主交流经验

---

🎉 **恭喜！** 您已经成功将博客接入 Chiral 网络。现在您的读者可以发现更多相关的优质内容了！ 