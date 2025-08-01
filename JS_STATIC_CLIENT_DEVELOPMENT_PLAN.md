# Chiral 网络 JS 静态客户端开发文档

本文档旨在为支持 RSS 双模式的 Chiral 网络提供纯 JavaScript 静态客户端的开发架构和实现逻辑。该客户端专注于在静态博客上**显示相关文章**，与现有 Chiral-Connector WordPress 插件在前端体验上保持完全一致。

## 1. 客户端定位和职责

### 1.1 核心定位
JS 静态客户端是一个**纯前端显示组件**，其职责范围：
- ✅ **显示相关文章**：在静态博客页面上展示 Chiral 网络的相关内容
- ✅ **前端交互**：提供与 Chiral-Connector 一致的用户界面和交互体验
- ✅ **样式兼容**：确保在不同静态博客平台上的样式一致性
- ❌ **不负责数据同步**：数据同步完全由 Hub 端的 RSS Crawler 处理
- ❌ **不包含认证**：无需任何认证信息，所有配置都是公开的显示配置

### 1.2 工作原理
```
静态博客页面 → JS 客户端 → WordPress.com Public API → 返回相关文章数据 → 前端渲染显示
```

**数据流说明**：
1. 静态博客的 RSS/Sitemap 已经被 Hub 的 RSS Crawler 抓取并存储为 chiral_data CPT
2. JS 客户端直接调用 WordPress.com 的 Related Posts Public API
3. 使用 Hub 域名和对应的 chiral_data CPT ID 作为查询参数
4. WordPress.com 返回相关文章数据，客户端负责渲染显示

## 2. 架构设计

### 2.1 设计原则
1. **纯显示客户端**：只负责前端显示，不涉及任何服务端逻辑
2. **配置简化**：只需要最基本的显示配置，无认证和同步配置
3. **样式复用**：完全复用 Chiral-Connector 的前端样式和交互逻辑
4. **轻量级**：纯 JavaScript 实现，无框架依赖
5. **敏捷同步**：与 Chiral-Connector 的前端部分保持同步更新
6. **英文**：注释与文案均使用英文，为后续国际化做铺垫

### 2.2 核心组件

```
chiral-static-client/
├── core/
│   ├── api.js                # API 调用模块 (只读)
│   ├── display.js            # 显示逻辑模块
│   ├── config.js             # 配置管理模块
│   └── utils.js              # 工具函数模块
├── assets/
│   ├── chiral-client.css     # 样式文件 (复用 Connector CSS)
│   └── chiral-client.js      # 打包后的 JS 文件
├── examples/                 # 各平台集成示例
│   ├── hugo/
│   ├── jekyll/
│   ├── hexo/
│   └── vuepress/
└── dist/                     # 构建输出
```

## 3. 配置设计

### 3.1 简化的配置结构
JS 静态客户端的配置极其简单，只包含显示相关的配置：

```javascript
window.ChiralConfig = {
    // 必需配置
    hubUrl: 'https://hub.example.com',        // Hub 地址
    nodeId: 'my-static-blog',                 // 当前站点的 Node ID
    
    // 可选显示配置
    display: {
        count: 5,                             // 显示文章数量
        enableCache: true,                    // 是否启用前端缓存
        cacheTTL: 3600,                       // 缓存时间 (秒)
        showThumbnails: true,                 // 是否显示缩略图
        showExcerpts: true                    // 是否显示摘要
    }
};
```

### 3.2 配置说明

#### 3.2.1 必需配置
- **hubUrl**: Hub 的公开访问地址，用于 API 调用
- **nodeId**: 当前静态博客在 Chiral 网络中的标识，由 Porter 在 Hub 端配置时确定

#### 3.2.2 显示配置（可选）
- **count**: 显示的相关文章数量，默认 5 篇
- **enableCache**: 是否启用浏览器缓存，默认 true
- **cacheTTL**: 缓存有效时间，默认 1 小时
- **showThumbnails**: 是否显示文章缩略图，默认 true
- **showExcerpts**: 是否显示文章摘要，默认 true

**注意**: 没有任何认证信息、RSS URL、同步间隔等配置，这些都在 Hub 端管理。

### 3.3 CPT ID 查找机制
JS 客户端需要先通过 WordPress.com API 查找当前页面对应的 chiral_data CPT ID：

#### 查找流程
1. **调用 WordPress.com Posts API 进行筛选**：
   ```
   GET https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts
   参数: 
   - type=chiral_data
   - meta_key=chiral_source_url  
   - meta_value={当前页面完整URL}
   ```

2. **从结果中提取 CPT ID**：
   ```javascript
   // API 返回的结果中，posts[0].ID 就是对应的 CPT ID
   const cptId = response.posts[0].ID;
   ```

3. **处理查找失败的情况**：
   - 如果没有找到匹配的 chiral_data，说明该页面尚未被 Hub 的 RSS Crawler 抓取
   - 显示友好的"暂无相关文章"消息

## 4. API 设计

### 4.1 API 调用逻辑
JS 客户端直接调用 **WordPress.com Public API**，完全复用 Chiral-Connector 的 API 逻辑：

```javascript
class ChiralAPI {
    constructor(hubUrl, nodeId) {
        this.hubUrl = hubUrl;
        this.nodeId = nodeId;
        this.hubDomain = new URL(hubUrl).hostname; // 用于 WordPress.com API
    }

    // 获取相关文章 (复用 Connector 的逻辑)
    async getRelatedPosts(currentPageUrl, count = 5) {
        // 1. 先查找当前页面对应的 CPT ID
        //    GET https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts
        //    参数: type=chiral_data, meta_key=chiral_source_url, meta_value=currentPageUrl
        // 2. 从查找结果中提取 CPT ID
        // 3. 调用 WordPress.com Related Posts API
        //    API: https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts/{cptId}/related  
        // 4. 对每个相关文章调用详情 API
        //    API: https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts/{relatedId}
        // 5. 处理返回数据，提取 chiral_source_url 等元数据
        // 6. 返回标准化的相关文章数据
    }

    // 测试连接 (可选)
    async testConnection() {
        // 测试 WordPress.com API 的可访问性
        // 可以调用 /sites/{hubDomain} 端点进行测试
    }
}
```

### 4.2 数据流程
1. **页面识别**: 解析当前页面的完整 URL
2. **缓存检查**: 检查 localStorage 中的缓存数据
3. **CPT ID 查找**: 调用 WordPress.com Posts API 查找对应的 chiral_data CPT ID
   - 使用 `meta_key=chiral_source_url&meta_value=当前页面URL` 筛选
4. **相关文章查询**: 使用找到的 CPT ID 调用 Related Posts API
   - API: `https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts/{cptId}/related`
5. **文章详情获取**: 对每个相关文章调用详情 API 获取完整信息
   - API: `https://public-api.wordpress.com/rest/v1.1/sites/{hubDomain}/posts/{relatedId}`
6. **数据处理**: 提取 chiral_source_url 等元数据，确定最终显示的 URL
7. **渲染显示**: 生成 HTML 并插入页面

### 4.3 错误处理
- **网络错误**: 优雅降级，显示默认消息
- **WordPress.com API 错误**: 显示友好的错误提示
- **CPT ID 查找失败**: 当无法找到对应的 chiral_data CPT ID 时的处理
- **数据错误**: 处理无效或缺失的数据

## 5. 显示逻辑设计

### 5.1 DOM 结构复用
完全复用 Chiral-Connector 的 DOM 结构和 CSS 类名：

```html
<!-- 占位符容器 -->
<div id="chiral-connector-related-posts" 
     class="chiral-connector-related-posts-container"
     data-post-url="https://blog.example.com/post/title"
     data-node-id="my-static-blog"
     data-hub-url="https://hub.example.com"
     data-count="5">
    Loading related Chiral data...
</div>

<!-- 渲染后的结构 -->
<div class="chiral-connector-related-posts-list">
    <h3>Related Posts</h3>
    <small class="chiral-hub-name-subtitle">
        From Chiral Network: <a href="https://hub.example.com">Hub Name</a>
    </small>
    <ul>
        <li>
            <div class="related-post-thumbnail">
                <a href="#" target="_blank">
                    <img src="thumbnail.jpg" alt="Post Title">
                </a>
            </div>
            <div class="related-post-content">
                <h4><a href="#" target="_blank">Post Title</a></h4>
                <div class="related-post-excerpt">Post excerpt...</div>
                <small class="related-post-source">Source: example.com</small>
            </div>
        </li>
    </ul>
</div>
```

### 5.2 JavaScript 渲染逻辑
直接复用 Chiral-Connector 的 `chiral-connector-public.js` 逻辑：

```javascript
class ChiralDisplay {
    constructor(config) {
        this.config = config;
        this.api = new ChiralAPI(config.hubUrl, config.nodeId);
    }

    // 初始化显示
    async init() {
        const container = document.getElementById('chiral-connector-related-posts');
        if (!container) return;

        // 复用 Connector 的渲染逻辑
        await this.loadAndRenderRelatedPosts(container);
    }

    // 渲染相关文章 (复用 Connector 的逻辑)
    async loadAndRenderRelatedPosts(container) {
        // 1. 显示加载状态
        // 2. 获取相关文章数据
        // 3. 生成 HTML (复用 renderRelatedPostItem 逻辑)
        // 4. 更新 DOM
    }
}
```

### 5.3 样式完全复用
直接使用 Chiral-Connector 的 CSS 文件，确保样式完全一致：

```css
/* 直接复制 chiral-connector-public.css 的内容 */
.chiral-connector-related-posts-container { /* ... */ }
.chiral-connector-related-posts-list { /* ... */ }
.related-post-thumbnail { /* ... */ }
.related-post-content { /* ... */ }
/* ... 其他样式 ... */
```

## 6. 部署和集成

### 6.1 CDN 部署 (推荐)
```html
<!-- 在静态博客模板中引入 -->
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.css">
<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.js"></script>

<!-- 配置 -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',
    nodeId: 'your-blog-id'
};
</script>

<!-- 在文章页面中添加容器 -->
<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"  <!-- Hugo 示例 -->
     data-node-id="your-blog-id"
     data-hub-url="https://your-hub.com"
     data-count="5">
</div>
```

### 6.2 各平台集成示例

#### 6.2.1 Hugo 集成
```html
<!-- layouts/partials/chiral-related.html -->
<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}"
     data-node-id="my-hugo-blog"
     data-hub-url="https://hub.example.com"
     data-count="5">
    Loading related Chiral data...
</div>
```

#### 6.2.2 Jekyll 集成
```html
<!-- _includes/chiral-related.html -->
<div id="chiral-connector-related-posts" 
     data-post-url="{{ page.url | absolute_url }}"
     data-node-id="my-jekyll-blog"
     data-hub-url="https://hub.example.com"
     data-count="5">
    Loading related Chiral data...
</div>
```

#### 6.2.3 Hexo 集成
```html
<!-- themes/your-theme/layout/_partial/chiral-related.ejs -->
<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-node-id="my-hexo-blog"
     data-hub-url="https://hub.example.com"
     data-count="5">
    Loading related Chiral data...
</div>
```

**注意**: 所有配置都通过 `window.ChiralConfig` 统一设置，不依赖各博客系统的配置文件。

## 7. 与 Chiral-Connector 的同步策略

### 7.1 代码复用策略
1. **API 逻辑复用**: 直接移植 `class-chiral-connector-api.php` 中的 WordPress.com API 调用逻辑
   - 复用 `get_related_post_ids_from_wp_api()` 方法
   - 复用 `get_post_details_from_wp_api()` 方法
   - **新增**: 需要实现 CPT ID 查找逻辑（通过 meta_key/meta_value 筛选）
2. **显示逻辑复用**: 移植 `chiral-connector-public.js` 的渲染逻辑
3. **样式完全复用**: 直接使用 `chiral-connector-public.css`
4. **错误处理复用**: 移植相同的错误处理和重试机制

### 7.2 同步更新机制
1. **版本对应**: 与 Chiral-Connector 保持相同的版本号
2. **功能同步**: 当 Connector 新增前端功能时，同步更新 JS 客户端
3. **样式同步**: 当 Connector 更新样式时，同步更新 CSS 文件
4. **API 兼容**: 确保 API 调用方式与 Connector 保持一致

### 7.3 差异点管理
- **认证差异**: JS 客户端不需要认证，调用公开 API
- **配置差异**: JS 客户端只需显示配置，不需要同步配置
- **部署差异**: JS 客户端支持 CDN 部署，Connector 是 WordPress 插件

## 8. 开发路线图

### 8.1 第一阶段：核心功能 (2-3 周)
- 移植 Chiral-Connector 的 API 调用逻辑 (去除认证部分)
- 移植前端显示逻辑和样式
- 实现基础的配置管理
- 完成 CDN 部署准备

### 8.2 第二阶段：平台集成 (2-3 周)
- 开发各大静态博客平台的集成示例
- 完善文档和使用指南
- 性能优化和缓存机制
- 错误处理和边界情况处理

### 8.3 第三阶段：发布和维护 (1-2 周)
- 建立 CDN 分发
- 完善测试和质量保证
- 建立与 Connector 的同步更新流程
- 社区文档和支持

## 9. 技术实现细节

### 9.1 核心文件结构
```javascript
// chiral-client.js 的核心结构
(function(window) {
    'use strict';
    
    // 配置管理
    class ChiralConfig { /* ... */ }
    
    // API 调用 (复用 Connector 逻辑)
    class ChiralAPI {
        // 查找当前页面对应的 CPT ID
        async findCptId(currentPageUrl) {
            const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${this.hubDomain}/posts`;
            const params = new URLSearchParams({
                type: 'chiral_data',
                meta_key: 'chiral_source_url',
                meta_value: currentPageUrl,
                _fields: 'ID'
            });
            
            const response = await fetch(`${apiUrl}?${params}`);
            const data = await response.json();
            
            if (data.posts && data.posts.length > 0) {
                return data.posts[0].ID;
            }
            throw new Error('页面对应的 CPT ID 未找到');
        }
        
        // 复用 Connector 的相关文章获取逻辑
        async getRelatedPosts(currentPageUrl, count = 5) { /* ... */ }
    }
    
    // 显示逻辑 (复用 Connector 逻辑)  
    class ChiralDisplay { /* ... */ }
    
    // 工具函数 (复用 Connector 逻辑)
    class ChiralUtils { /* ... */ }
    
    // 自动初始化
    document.addEventListener('DOMContentLoaded', function() {
        if (window.ChiralConfig) {
            const display = new ChiralDisplay(window.ChiralConfig);
            display.init();
        }
    });
    
})(window);
```

### 9.2 缓存策略
```javascript
// localStorage 缓存实现
class ChiralCache {
    static set(key, data, ttl) {
        const item = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl * 1000
        };
        localStorage.setItem(`chiral_${key}`, JSON.stringify(item));
    }
    
    static get(key) {
        const item = localStorage.getItem(`chiral_${key}`);
        if (!item) return null;
        
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > parsed.ttl) {
            localStorage.removeItem(`chiral_${key}`);
            return null;
        }
        
        return parsed.data;
    }
}
```

## 10. 国际化设计

### 10.1 国际化架构

#### 10.1.1 设计原则
- **配置驱动**: 通过配置文件设置语言，不提供前台切换功能
- **轻量级**: 不依赖外部国际化库，实现简洁的内置 i18n 系统
- **静态化**: 语言在初始化时确定，符合静态博客的特性
- **回退机制**: 提供完善的语言回退策略
- **扩展性**: 便于添加新语言和自定义翻译

#### 10.1.2 语言包结构
```javascript
// 语言包格式（与 Chiral-Connector 完全对齐）
const i18nMessages = {
    'en': {
        'loading': 'Loading related Chiral data...',
        'relatedTitle': 'Related Content',
        'noData': 'No related Chiral data found at the moment.',
        'fetchError': 'Error fetching related data',
        'configError': 'Chiral Connector: Configuration error for related posts.',
        'source': 'Source: {0}',
        'fromChiralNetwork': 'From Chiral Network: {0}'
    },
    'zh-CN': {
        'loading': '正在加载相关 Chiral 数据...',
        'relatedTitle': '相关内容',
        'noData': '暂时没有找到相关 Chiral 数据。',
        'fetchError': '获取相关数据时出错',
        'configError': 'Chiral Connector：相关文章配置错误。',
        'source': '来源：{0}',
        'fromChiralNetwork': '来自 Chiral 网络：{0}'
    },
    'zh-TW': {
        'loading': '正在載入相關 Chiral 資料...',
        'relatedTitle': '相關內容',
        'noData': '暫時沒有找到相關 Chiral 資料。',
        'fetchError': '獲取相關資料時出錯',
        'configError': 'Chiral Connector：相關文章配置錯誤。',
        'source': '來源：{0}',
        'fromChiralNetwork': '來自 Chiral 網路：{0}'
    },
    'ja': {
        'loading': '関連 Chiral データを読み込み中...',
        'relatedTitle': '関連コンテンツ',
        'noData': '関連 Chiral データが見つかりませんでした。',
        'fetchError': '関連データの取得エラー',
        'configError': 'Chiral Connector：関連記事の設定エラー。',
        'source': 'ソース：{0}',
        'fromChiralNetwork': 'Chiral ネットワークから：{0}'
    }
};
```

### 10.2 国际化实现

#### 10.2.1 核心 i18n 类
```javascript
class ChiralI18n {
    constructor(locale = 'en', messages = {}) {
        this.locale = locale;
        this.messages = messages;
        this.fallbackLocale = 'en';
    }

    // 设置语言
    setLocale(locale) {
        this.locale = locale;
    }

    // 获取翻译文本
    t(key, params = []) {
        let message = this.getMessage(key, this.locale);
        
        // 如果当前语言没有找到，尝试回退语言
        if (!message && this.locale !== this.fallbackLocale) {
            message = this.getMessage(key, this.fallbackLocale);
        }
        
        // 如果还是没有找到，返回 key 本身
        if (!message) {
            console.warn(`Translation key "${key}" not found for locale "${this.locale}"`);
            return key;
        }

        // 处理参数替换 {0}, {1}, etc.
        return this.interpolate(message, params);
    }

    // 获取指定语言的消息
    getMessage(key, locale) {
        const localeMessages = this.messages[locale];
        if (!localeMessages) return null;
        
        // 支持嵌套键 'error.network'
        return key.split('.').reduce((obj, keyPart) => {
            return obj && obj[keyPart];
        }, localeMessages);
    }

    // 参数插值
    interpolate(message, params) {
        return message.replace(/\{(\d+)\}/g, (match, index) => {
            return params[index] !== undefined ? params[index] : match;
        });
    }

         // 从配置获取语言设置
     static getConfiguredLocale(config) {
         // 直接从配置获取，不自动检测
         return config.i18n?.locale || 'en';
     }

    // 规范化语言代码
    static normalizeLocale(locale) {
        const localeMap = {
            'zh': 'zh-CN',
            'zh-cn': 'zh-CN',
            'zh-tw': 'zh-TW',
            'zh-hk': 'zh-TW',
            'en': 'en',
            'en-us': 'en',
            'en-gb': 'en',
            'ja': 'ja',
            'ja-jp': 'ja'
        };
        
        return localeMap[locale.toLowerCase()] || 'en';
    }
}
```

#### 10.2.2 配置扩展
```javascript
// 扩展配置以支持国际化
window.ChiralConfig = {
    // 必需配置
    hubUrl: 'https://hub.example.com',
    nodeId: 'my-static-blog',
    
         // 国际化配置
     i18n: {
         locale: 'zh-CN',                      // 固定语言设置: 'en' | 'zh-CN' | 'zh-TW' | 'ja'
         fallbackLocale: 'en',                 // 回退语言
         customMessages: {                     // 自定义翻译（可选）
             'zh-CN': {
                 'customKey': '自定义中文文本'
             }
         }
     },
    
    // 显示配置
    display: {
        count: 5,
        enableCache: true,
        cacheTTL: 3600,
        showThumbnails: true,
        showExcerpts: true
    }
};
```

### 10.3 语言包管理

#### 10.3.1 内置语言包
```javascript
// 内置核心语言包，与 Chiral-Connector 对齐
const CORE_MESSAGES = {
    'en': {
        'loading': 'Loading related Chiral data...',
        'relatedTitle': 'Related Content',
        'noData': 'No related Chiral data found at the moment.',
        'fetchError': 'Error fetching related data'
    },
    'zh-CN': {
        'loading': '正在加载相关 Chiral 数据...',
        'relatedTitle': '相关内容',
        'noData': '暂时没有找到相关 Chiral 数据。',
        'fetchError': '获取相关数据时出错'
    }
};
```

#### 10.3.2 内置完整语言包
```javascript
// 完整的内置语言包，与 Chiral-Connector 完全对齐
const FULL_MESSAGES = {
    'en': {
        'loading': 'Loading related Chiral data...',
        'relatedTitle': 'Related Content',
        'noData': 'No related Chiral data found at the moment.',
        'fetchError': 'Error fetching related data',
        'configError': 'Chiral Connector: Configuration error for related posts.',
        'source': 'Source: {0}',
        'fromChiralNetwork': 'From Chiral Network: {0}'
    },
    'zh-CN': {
        'loading': '正在加载相关 Chiral 数据...',
        'relatedTitle': '相关内容',
        'noData': '暂时没有找到相关 Chiral 数据。',
        'fetchError': '获取相关数据时出错',
        'configError': 'Chiral Connector：相关文章配置错误。',
        'source': '来源：{0}',
        'fromChiralNetwork': '来自 Chiral 网络：{0}'
    },
    'zh-TW': {
        'loading': '正在載入相關 Chiral 資料...',
        'relatedTitle': '相關內容',
        'noData': '暫時沒有找到相關 Chiral 資料。',
        'fetchError': '獲取相關資料時出錯',
        'configError': 'Chiral Connector：相關文章配置錯誤。',
        'source': '來源：{0}',
        'fromChiralNetwork': '來自 Chiral 網路：{0}'
    },
    'ja': {
        'loading': '関連 Chiral データを読み込み中...',
        'relatedTitle': '関連コンテンツ',
        'noData': '関連 Chiral データが見つかりませんでした。',
        'fetchError': '関連データの取得エラー',
        'configError': 'Chiral Connector：関連記事の設定エラー。',
        'source': 'ソース：{0}',
        'fromChiralNetwork': 'Chiral ネットワークから：{0}'
    }
};
```

### 10.4 集成到主要组件

#### 10.4.1 显示组件集成
```javascript
class ChiralDisplay {
    constructor(config) {
        this.config = config;
        this.api = new ChiralAPI(config.hubUrl, config.nodeId);
        
        // 初始化国际化
        this.initI18n();
    }

         initI18n() {
         const i18nConfig = this.config.i18n || {};
         const locale = ChiralI18n.getConfiguredLocale(this.config);
         const normalizedLocale = ChiralI18n.normalizeLocale(locale);
         
         // 使用内置完整语言包
         let messages = { ...FULL_MESSAGES };
         
         // 合并自定义消息（如果有）
         if (i18nConfig.customMessages) {
             Object.keys(i18nConfig.customMessages).forEach(lang => {
                 messages[lang] = { ...messages[lang], ...i18nConfig.customMessages[lang] };
             });
         }
         
         this.i18n = new ChiralI18n(normalizedLocale, messages);
     }

    // 更新渲染方法以使用国际化
    renderLoadingState(container) {
        container.innerHTML = `<p class="chiral-loading">${this.i18n.t('loading')}</p>`;
    }

    renderNoDataState(container) {
        const html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                <p class="chiral-no-related-posts">${this.i18n.t('noData')}</p>
            </div>
        `;
        container.innerHTML = html;
    }

    renderErrorState(container, error) {
        const errorMsg = `${this.i18n.t('fetchError')}: ${error.message}`;
        const html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                <p class="chiral-no-related-posts">${errorMsg}</p>
            </div>
        `;
        container.innerHTML = html;
    }
}
```

### 10.5 配置文件语言设置

#### 10.5.1 直接配置语言
用户直接在 Chiral 客户端配置中设置语言，不依赖博客系统的站点设置：

```javascript
// 简单直接的配置方式
window.ChiralConfig = {
    hubUrl: 'https://hub.example.com',
    nodeId: 'my-static-blog',
    i18n: {
        locale: 'zh-CN'  // 直接设置需要的语言
    }
};
```

#### 10.5.2 支持的语言选项
- `'en'` - English
- `'zh-CN'` - 简体中文
- `'zh-TW'` - 繁体中文
- `'ja'` - 日本語

用户根据自己博客的主要语言选择对应的设置即可。

### 10.6 部署配置

#### 10.6.1 CDN 部署配置
```html
<!-- 基础部署 -->
<link rel="stylesheet" href="https://cdn.chiral-network.com/static-client/v1/chiral-client.css">
<script src="https://cdn.chiral-network.com/static-client/v1/chiral-client.js"></script>

<!-- 配置语言（根据静态博客的语言设置） -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://your-hub.com',
    nodeId: 'your-blog-id',
    i18n: {
        locale: 'zh-CN'  // 固定设置，不动态检测
    }
};
</script>
```

#### 10.6.2 静态博客平台集成
```html
<!-- 通用集成示例 -->
<div id="chiral-connector-related-posts" 
     data-post-url="https://blog.example.com/post/title"
     data-node-id="my-static-blog"
     data-hub-url="https://hub.example.com"
     data-count="5">
    Loading related Chiral data...
</div>

<!-- 配置脚本 -->
<script>
window.ChiralConfig = {
    hubUrl: 'https://hub.example.com',
    nodeId: 'my-static-blog',
    i18n: {
        locale: 'zh-CN'  // 用户根据博客语言直接设置
    }
};
</script>
```

**各平台集成要点**：
- **Hugo**: 在模板中设置 `data-post-url="{{ .Permalink }}"`
- **Jekyll**: 在模板中设置 `data-post-url="{{ page.url | absolute_url }}"`
- **Hexo**: 在模板中设置 `data-post-url="<%= config.url %><%= url_for(page.path) %>"`
- **其他平台**: 确保 `data-post-url` 是文章的完整 URL 即可

语言配置与博客系统无关，用户直接在 `ChiralConfig.i18n.locale` 中设置。

### 10.7 开发和维护

#### 10.7.1 翻译工作流
1. **提取文本**: 从代码中提取所有需要翻译的文本
2. **内置翻译**: 直接在 FULL_MESSAGES 中添加新语言
3. **翻译**: 专业翻译或社区贡献
4. **验证**: 翻译质量检查和功能测试
5. **发布**: 更新 JS 文件并发布新版本（所有语言包都内置）

#### 10.7.2 质量保证
```javascript
// 翻译完整性检查
class ChiralI18nValidator {
    static validateMessages(messages, referenceLocale = 'en') {
        const reference = messages[referenceLocale];
        if (!reference) {
            throw new Error(`Reference locale ${referenceLocale} not found`);
        }

        const referenceKeys = this.getAllKeys(reference);
        const issues = [];

        Object.keys(messages).forEach(locale => {
            if (locale === referenceLocale) return;

            const localeKeys = this.getAllKeys(messages[locale]);
            const missing = referenceKeys.filter(key => !localeKeys.includes(key));
            const extra = localeKeys.filter(key => !referenceKeys.includes(key));

            if (missing.length > 0) {
                issues.push({ locale, type: 'missing', keys: missing });
            }
            if (extra.length > 0) {
                issues.push({ locale, type: 'extra', keys: extra });
            }
        });

        return issues;
    }

    static getAllKeys(obj, prefix = '') {
        let keys = [];
        Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                keys = keys.concat(this.getAllKeys(obj[key], fullKey));
            } else {
                keys.push(fullKey);
            }
        });
        return keys;
    }
}
```

## 11. 总结

JS 静态客户端的核心特点：

1. **纯前端组件**: 只负责显示，不涉及数据同步和认证
2. **配置极简**: 只需要 Hub URL 和 Node ID 两个必需配置
3. **完全复用**: 最大化复用 Chiral-Connector 的前端代码和样式
4. **轻量级**: 无框架依赖，兼容性好，部署简单
5. **平台无关**: 可以集成到任何静态博客平台
6. **国际化支持**: 内置完整的多语言支持，便于全球化部署

通过这种设计，静态博客用户可以非常简单地加入 Chiral 网络，只需要：
1. Porter 在 Hub 端配置好 RSS/Sitemap 抓取
2. 在静态博客中引入 JS 客户端
3. 配置 Hub URL 和 Node ID
4. 在文章页面添加显示容器

就能获得与 WordPress 站点完全一致的 Chiral 网络相关文章体验！ 