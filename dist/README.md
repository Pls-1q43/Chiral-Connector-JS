# Chiral 网络 JavaScript 静态客户端

> 为静态博客提供 Chiral 网络相关文章显示功能的纯 JavaScript 客户端

## 概述

Chiral JavaScript 静态客户端是一个轻量级的前端库，专为静态博客平台（Hugo、Jekyll、Hexo、VuePress 等）设计，让静态站点能够展示来自 Chiral 网络的相关文章。

### 特性

- ✅ **纯前端实现** - 无需服务端配置，直接调用 WordPress.com Public API
- ✅ **极简配置** - 只需 Hub URL 和 Node ID 两个必需参数
- ✅ **样式一致** - 完全复用 Chiral-Connector 的前端样式
- ✅ **多语言支持** - 内置中文（简体/繁体）、英文、日文支持
- ✅ **智能缓存** - 基于 localStorage 的自动缓存机制
- ✅ **响应式设计** - 支持移动端和暗色模式
- ✅ **平台无关** - 支持所有主流静态博客平台

## 快速开始

### 1. 基础集成

在您的静态博客页面中添加以下代码：

```html
<!-- CSS 样式 (推荐使用 min 版本) -->
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.min.css">

<!-- 配置 -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com'
};
</script>

<!-- 显示容器 -->
<div id="chiral-connector-related-posts" 
     data-post-url="https://your-blog.com/current-post"
     data-hub-url="https://your-hub.com"
     data-count="5">
    Loading related Chiral data...
</div>

<!-- JavaScript 客户端 (推荐使用 min 版本，加载更快) -->
<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.min.js"></script>
```

> 💡 **版本选择**：推荐使用 `.min.js` 和 `.min.css` 版本，文件更小，加载更快，功能完全相同。详见 [版本对比指南](VERSIONS_GUIDE.md)。

### 2. 平台特定集成

#### Hugo

将以下内容保存为 `layouts/partials/chiral-related.html`：

```html
{{ if .Site.Params.chiral.enable }}
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.css">

<script>
window.ChiralConfig = {
    hubUrl: '{{ .Site.Params.chiral.hubUrl }}',
    display: {
        count: {{ .Site.Params.chiral.count | default 5 }}
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-hub-url="{{ .Site.Params.chiral.hubUrl }}">
    Loading related Chiral data...
</div>

<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.js"></script>
{{ end }}
```

在 `config.yaml` 中配置：

```yaml
params:
  chiral:
    enable: true
    hubUrl: "https://your-hub.com"
    count: 5
```

#### Jekyll

将以下内容保存为 `_includes/chiral-related.html`：

```html
{% if site.chiral.enable %}
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.css">

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

<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.js"></script>
{% endif %}
```

在 `_config.yml` 中配置：

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  count: 5
```

## 配置选项

### 必需配置

| 选项 | 类型 | 说明 |
|------|------|------|
| `hubUrl` | string | Chiral Hub 的完整 URL |

> **重要**：无需配置 `nodeId`，客户端通过域名验证自动确定身份。

### 显示配置（可选）

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `display.count` | number | 5 | 显示的相关文章数量 |
| `display.enableCache` | boolean | true | 是否启用浏览器缓存 |
| `display.cacheTTL` | number | 3600 | 缓存有效时间（秒） |
| `display.showThumbnails` | boolean | true | 是否显示文章缩略图 |
| `display.showExcerpts` | boolean | true | 是否显示文章摘要 |

### 国际化配置（可选）

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `i18n.locale` | string | 'en' | 界面语言（en/zh-CN/zh-TW/ja） |
| `i18n.customMessages` | object | {} | 自定义翻译文本 |

### 完整配置示例

```javascript
window.ChiralConfig = {
    // 必需配置
    hubUrl: 'https://hub.example.com',
    
    // 显示配置
    display: {
        count: 5,
        enableCache: true,
        cacheTTL: 3600,
        showThumbnails: true,
        showExcerpts: true
    },
    
    // 国际化配置
    i18n: {
        locale: 'zh-CN',
        customMessages: {
            'zh-CN': {
                'customKey': '自定义文本'
            }
        }
    }
};
```

## 高级用法

### 编程式 API

```javascript
// 手动初始化
const client = ChiralClient.init({
    hubUrl: 'https://hub.example.com'
});

// 获取特定 URL 的相关文章
const relatedPosts = await client.getRelatedPosts('https://blog.com/post', 5);

// 测试连接
const isConnected = await client.testConnection();

// 清除缓存
const clearedItems = client.clearCache();

// 获取缓存统计
const stats = client.getCacheStats();
```

### 事件和回调

```javascript
// 监听初始化完成
window.addEventListener('chiralClientReady', function(event) {
    console.log('Chiral Client ready:', event.detail);
});

// 监听数据加载
window.addEventListener('chiralDataLoaded', function(event) {
    console.log('Related posts loaded:', event.detail.posts);
});
```

## 开发和构建

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-org/chiral-connector-js.git
cd chiral-connector-js

# 安装依赖
npm install

# 构建开发版本
npm run build:dev

# 构建生产版本
npm run build:prod

# 启动开发服务器
npm run serve
```

### 项目结构

```
chiral-connector-js/
├── core/                  # 核心模块
│   ├── config.js         # 配置管理
│   ├── i18n.js           # 国际化
│   ├── cache.js          # 缓存管理
│   ├── api.js            # API 调用
│   ├── display.js        # 显示逻辑
│   └── utils.js          # 工具函数
├── assets/               # 资源文件
│   ├── chiral-client.css # 样式文件
│   └── chiral-client.js  # 主入口
├── examples/             # 平台集成示例
│   ├── hugo/
│   ├── jekyll/
│   ├── hexo/
│   └── vuepress/
├── dist/                 # 构建输出
└── build/                # 构建脚本
```

## 工作原理

采用混合架构，最小化 Hub 负载的同时解决跨域限制：

1. **数据同步**：静态博客的 RSS/Sitemap 由 Hub 端的 RSS Crawler 自动抓取
2. **CPT 查找**：客户端直接调用 WordPress.com API 查找当前页面的 chiral_data CPT（GET 请求）
3. **相关文章 ID**：通过 Hub 代理获取相关文章 ID 列表（解决 POST 跨域问题）
4. **文章详情**：客户端直接调用 WordPress.com API 获取每篇相关文章的详情（GET 请求）
5. **前端渲染**：生成 HTML 并插入页面指定容器

### 架构优势

- 🚀 **性能优化**：减少 Hub 端负载，大部分请求直接访问 WordPress.com
- 🔧 **独立运行**：不再依赖 Jetpack Related Posts 功能，避免与 Node 站点冲突
- ⚡ **响应快速**：并行处理多个 GET 请求，提升响应速度
- 💾 **缓存高效**：利用浏览器和 CDN 缓存 WordPress.com API 响应
- 🛡️ **简化部署**：Hub 端无需启用 Jetpack Related Posts 模块

## 安全机制

- **公开 API**：使用 WordPress.com 公开 API，无需身份验证
- **无敏感配置**：客户端无需任何认证信息或密钥
- **简化架构**：移除复杂的域名验证，专注核心功能

## 浏览器支持

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- 移动端浏览器

## 许可证

MIT License

## 支持和贡献

- 问题反馈：[GitHub Issues](https://github.com/your-org/chiral-connector-js/issues)
- 功能请求：[GitHub Discussions](https://github.com/your-org/chiral-connector-js/discussions)
- 贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)

## 版本历史

### v1.0.0
- 初始版本发布
- 支持基础的相关文章显示功能
- 多语言支持（中英日）
- 主流静态博客平台集成示例 