# Chiral 网络 JavaScript 静态客户端

> 为静态博客提供 Chiral 网络相关文章显示功能的纯 JavaScript 客户端

## 概述

Chiral JavaScript 静态客户端是一个轻量级的前端库，专为静态博客平台（Hugo、Jekyll、Hexo、VuePress 等）设计，让静态站点能够展示来自 Chiral 网络的相关文章。

### ⭐ 核心特性

- ✅ **纯前端实现** - 无需服务端配置，直接调用 WordPress.com Public API
- ✅ **极简配置** - 只需 Hub URL 一个必需参数，无需 Node ID
- ✅ **智能识别** - 基于域名自动识别站点身份
- ✅ **混合架构** - 优化性能，减少 Hub 负载
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

> **重要**：无需配置 `nodeId`，客户端通过域名自动识别站点身份，大大简化了配置过程。

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

### 🏗️ 项目结构

```
chiral-connector-js/
├── core/                  # 核心模块
│   ├── config.js         # 配置管理 (验证、规范化、默认值)
│   ├── api.js            # API 调用 (WordPress.com API + Hub 代理)
│   ├── display.js        # 显示逻辑 (渲染、状态管理)
│   ├── cache.js          # 缓存管理 (localStorage + TTL)
│   ├── i18n.js           # 国际化 (多语言支持)
│   └── utils.js          # 工具函数 (日志、验证等)
├── assets/               # 前端资源
│   ├── chiral-client.js  # 主入口文件 (统一接口)
│   └── chiral-client.css # 样式文件 (响应式 + 暗色模式)
├── examples/             # 平台集成示例
│   ├── hugo/             # Hugo 集成模板
│   ├── jekyll/           # Jekyll 集成模板
│   ├── hexo/             # Hexo 集成模板
│   └── vuepress/         # VuePress 组件
├── dist/                 # 构建输出 (生产版本)
│   ├── chiral-client.min.js    # 压缩版 JS
│   └── chiral-client.min.css   # 压缩版 CSS
└── build/                # 构建工具
    ├── build.js          # 主构建脚本
    └── serve.js          # 开发服务器
```

## 🔧 工作原理

采用创新的混合架构，在保证功能完整性的同时最大化性能：

### 数据流程
1. **RSS 自动抓取**：Hub 端的 RSS Crawler 自动抓取静态博客的 RSS/Sitemap
2. **智能匹配**：客户端基于当前页面 URL 查找对应的 `chiral_data` CPT
3. **相关文章查询**：通过 Hub 代理端点获取相关文章 ID 列表（解决 CORS 限制）
4. **并行获取详情**：直接调用 WordPress.com API 并行获取各文章详细信息
5. **智能渲染**：生成 HTML 并插入指定容器，复用 Chiral-Connector 样式

### 🎯 架构优势

- 🚀 **性能优化**：80% 请求直接访问 WordPress.com，减少 Hub 负载
- 🔧 **配置简化**：无需 Node ID，基于域名自动识别
- ⚡ **响应快速**：并行处理多个 API 请求，提升响应速度
- 💾 **缓存高效**：智能缓存策略，支持 TTL 和自动清理
- 🛡️ **部署简单**：Hub 端无需复杂配置，专注数据同步
- 🔒 **安全可靠**：使用公开 API，无需认证信息

## 🔒 安全机制

- **公开 API**：使用 WordPress.com 公开 API，无需身份验证
- **无敏感配置**：客户端无需任何认证信息或密钥
- **域名验证**：Hub 端基于 Referer 头进行域名验证
- **XSS 防护**：所有用户输入经过严格的 HTML 转义
- **CORS 友好**：通过 Hub 代理解决跨域限制

## 🌐 浏览器支持

| 浏览器 | 版本要求 | 说明 |
|--------|----------|------|
| Chrome | 80+ | 完全支持 |
| Edge | 80+ | 完全支持 |
| Firefox | 75+ | 完全支持 |
| Safari | 13+ | 完全支持 |
| 移动浏览器 | 现代版本 | 响应式适配 |

## 📋 路线图

- [ ] TypeScript 类型定义
- [ ] React/Vue 组件封装
- [ ] 更多静态站点生成器支持
- [ ] 性能监控和分析
- [ ] 主题系统和自定义样式

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 支持和贡献

- 问题反馈：[GitHub Issues](https://github.com/your-org/chiral-connector-js/issues)
- 功能请求：[GitHub Discussions](https://github.com/your-org/chiral-connector-js/discussions)
- 贡献指南：[CONTRIBUTING.md](CONTRIBUTING.md)
- 技术文档：[Wiki](https://github.com/your-org/chiral-connector-js/wiki)

## 📚 版本历史

### v1.0.0 (当前版本)
- ✨ 初始版本发布
- ✨ 混合架构设计，优化性能
- ✨ 智能域名识别，无需 Node ID
- ✨ 完整的多语言支持（中英日）
- ✨ 智能缓存机制，支持 TTL
- ✨ 主流静态博客平台集成示例
- ✨ 响应式设计和暗色模式支持 