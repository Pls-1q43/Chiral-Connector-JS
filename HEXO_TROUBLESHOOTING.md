# 🔧 Hexo 集成故障排除指南

> 专门解决 Hexo 集成 Chiral 客户端时的常见问题

## 📋 您的配置分析

根据您提供的配置：
```yaml
chiral:
  enable: true
  hubUrl: "https://ckc.akashio.com"
  nodeId: "node_6afec7e63524cfff3db726467e743536"
  count: 5
```

**配置看起来是正确的！** 问题可能出现在其他地方。

## 🔍 "Chiral Client configuration error" 原因分析

### 可能原因 1：配置文件位置错误

**检查点**：确认配置是在正确的文件中

- ✅ **正确位置**：`_config.yml`（站点根目录）
- ❌ **错误位置**：`themes/your-theme/_config.yml`（主题配置文件）

**解决方案**：
```bash
# 确认您的配置在站点根目录的 _config.yml 中
cat _config.yml | grep -A 5 "chiral:"
```

### 可能原因 2：模板代码问题

**检查点**：确认 EJS 模板语法正确

**正确的模板代码**：
```ejs
<% if (config.chiral && config.chiral.enable) { %>
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<script>
window.ChiralConfig = {
    hubUrl: '<%= config.chiral.hubUrl %>',
    nodeId: '<%= config.chiral.nodeId %>',
    display: {
        count: <%= config.chiral.count || 5 %>
    }
};
</script>

<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-node-id="<%= config.chiral.nodeId %>"
     data-hub-url="<%= config.chiral.hubUrl %>">
    Loading related Chiral data...
</div>

<script src="/assets/chiral-client.min.js"></script>
<% } %>
```

### 可能原因 3：文件路径问题

**检查点**：确认 JS 和 CSS 文件存在

```bash
# 检查文件是否存在
ls -la themes/your-theme/source/assets/ | grep chiral
# 或者如果放在 source 目录
ls -la source/assets/ | grep chiral
```

### 可能原因 4：JavaScript 加载时机问题

**问题**：JavaScript 文件加载时配置还未就绪

**解决方案**：确保配置在 JS 文件加载前设置
```ejs
<!-- 1. 先设置配置 -->
<script>
window.ChiralConfig = {
    hubUrl: '<%= config.chiral.hubUrl %>',
    nodeId: '<%= config.chiral.nodeId %>'
};
</script>

<!-- 2. 再加载客户端 -->
<script src="/assets/chiral-client.min.js"></script>
```

## 🛠️ 完整的调试步骤

### 步骤 1：验证配置加载

在模板中添加调试代码：
```ejs
<!-- 临时调试代码 -->
<script>
console.log('Hexo config.chiral:', <%- JSON.stringify(config.chiral) %>);
console.log('Current URL:', '<%= config.url %><%= url_for(page.path) %>');
</script>
```

### 步骤 2：检查浏览器控制台

打开浏览器开发者工具，查看：
1. **网络标签**：检查 JS/CSS 文件是否正确加载
2. **控制台标签**：查看具体错误信息
3. **应用标签**：检查 localStorage 中是否有缓存

### 步骤 3：手动测试配置

在浏览器控制台中运行：
```javascript
// 检查配置是否正确加载
console.log('window.ChiralConfig:', window.ChiralConfig);

// 检查客户端是否初始化
console.log('chiralClientInstance:', window.chiralClientInstance);

// 手动测试连接
if (window.chiralClientInstance) {
    window.chiralClientInstance.testConnection().then(result => {
        console.log('Connection test:', result);
    });
}
```

## 💡 推荐的 Hexo 集成方案

### 方案一：使用本地文件（推荐）

**1. 下载文件到主题**
```bash
# 在您的 Hexo 站点根目录
mkdir -p themes/your-theme/source/assets
cd themes/your-theme/source/assets

# 下载文件（替换为实际的下载链接）
wget https://your-cdn.com/chiral-client.min.js
wget https://your-cdn.com/chiral-client.min.css
```

**2. 创建模板文件**
`themes/your-theme/layout/_partial/chiral-related.ejs`：
```ejs
<% if (config.chiral && config.chiral.enable) { %>
<!-- Chiral Static Client CSS -->
<link rel="stylesheet" href="<%- url_for('/assets/chiral-client.min.css') %>">

<!-- Chiral Configuration -->
<script>
window.ChiralConfig = {
    hubUrl: '<%= config.chiral.hubUrl %>',
    nodeId: '<%= config.chiral.nodeId %>',
    display: {
        count: <%= config.chiral.count || 5 %>,
        enableCache: true,
        cacheTTL: 43200
    },
    i18n: {
        locale: '<%= config.chiral.locale || "en" %>'
    }
};
</script>

<!-- Chiral Related Posts Container -->
<div id="chiral-connector-related-posts" 
     data-post-url="<%= config.url %><%= url_for(page.path) %>"
     data-node-id="<%= config.chiral.nodeId %>"
     data-hub-url="<%= config.chiral.hubUrl %>">
    正在加载相关 Chiral 数据...
</div>

<!-- Chiral Static Client JavaScript -->
<script src="<%- url_for('/assets/chiral-client.min.js') %>"></script>
<% } %>
```

**3. 在文章模板中引入**
`themes/your-theme/layout/post.ejs`：
```ejs
<!-- 文章内容 -->
<%- partial('_partial/article', {post: page, index: false}) %>

<!-- Chiral 相关文章 -->
<%- partial('_partial/chiral-related') %>
```

### 方案二：使用 CDN

如果您想使用 CDN，确保 CDN 地址正确：
```ejs
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chiral-static-client@latest/dist/chiral-client.min.css">
<script src="https://cdn.jsdelivr.net/npm/chiral-static-client@latest/dist/chiral-client.min.js"></script>
```

## 🔍 针对您配置的具体检查

### 检查 Hub 连接

在浏览器控制台测试您的 Hub：
```javascript
// 测试 Hub 是否可访问
fetch('https://ckc.akashio.com')
  .then(response => console.log('Hub accessible:', response.ok))
  .catch(error => console.error('Hub connection error:', error));

// 测试 WordPress.com API
fetch('https://public-api.wordpress.com/rest/v1.1/sites/ckc.akashio.com')
  .then(response => response.json())
  .then(data => console.log('WordPress API response:', data))
  .catch(error => console.error('API error:', error));
```

### 验证 Node ID 格式

您的 Node ID `node_6afec7e63524cfff3db726467e743536` 看起来是正确的格式。

## 🚀 快速修复建议

### 立即尝试的解决方案

1. **清除 Hexo 缓存**
```bash
hexo clean && hexo generate
```

2. **检查模板语法**
确认没有多余的空格或特殊字符：
```yaml
chiral:
  enable: true
  hubUrl: "https://ckc.akashio.com"
  nodeId: "node_6afec7e63524cfff3db726467e743536"
  count: 5
```

3. **添加调试日志**
在模板中临时添加：
```ejs
<script>
console.log('Chiral config loaded:', {
    enable: '<%= config.chiral.enable %>',
    hubUrl: '<%= config.chiral.hubUrl %>',
    nodeId: '<%= config.chiral.nodeId %>'
});
</script>
```

4. **检查页面 URL 生成**
确认 `<%= config.url %><%= url_for(page.path) %>` 生成正确的 URL。

## 📞 进一步帮助

如果问题仍然存在，请提供：
1. **浏览器控制台的完整错误信息**
2. **Hexo 版本** (`hexo version`)
3. **使用的主题名称**
4. **完整的模板文件内容**

我们可以进一步分析具体问题！ 