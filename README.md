# Chiral Network JS Client Usage Guide

> 📖 **For Static Blog Owners**: How to use Chiral JS client to join the Chiral network

## 🎯 What is Chiral Network JS Client?

Chiral JS Client is a lightweight JavaScript library designed specifically for static blogs, allowing your static sites (Hugo, Jekyll, Hexo, VuePress, etc.) to display related articles from the Chiral network, achieving cross-site related article recommendations and breaking information silos.
Using an innovative hybrid architecture, no complex configuration needed - just one Hub address to access the entire Chiral content ecosystem.

## 📋 Prerequisites

Before getting started, you need:

1. **A static blog site** (Hugo, Jekyll, Hexo, VuePress, etc.)
2. **Join the Chiral Network**: You need to register on an established Chiral Network Hub first.
3. **Obtain Hub address**:
   - `Hub URL`: The Chiral Hub address you joined

> 💡 **How to join the Chiral Network?**  
> Register on a Chiral Hub, fill in your blog's RSS address, Sitemap, complete the initial sync, and RSS will automatically crawl.

## 🚀 Quick Start (1 Minute Setup)

### Just add 3 lines of code!

1. **Download files**: Download `chiral-client.min.js` and `chiral-client.min.css` from the project's `dist/` directory
2. **Copy & Paste**: Add the following code to your **single post template**:

```html
<!-- Include styles -->
<link rel="stylesheet" href="/assets/chiral-client.min.css">

<!-- Related posts container -->
<div id="chiral-related-posts">Loading related Chiral data...</div>

<!-- Include client (with configuration parameters) -->
<script src="/assets/chiral-client.min.js" 
        data-container="chiral-related-posts" 
        data-hub-url="https://your-hub.com" 
        data-count="5" 
        data-auto-init="true"></script>
```

**Parameter explanation**:
- `data-hub-url`: Replace with your Chiral Hub address
- `data-count`: Number of articles to display (optional, default 5)
- `data-container`: Container ID (must match the div's id)

🎉 **Done!** Visit article pages to see related posts. No config files, no complex setup!

## ⚙️ Detailed Configuration Options

### Basic Configuration

```javascript
window.ChiralConfig = {
    // 【Required】Hub address (only required configuration)
    hubUrl: 'https://hub.example.com',
    
    // 【Optional】Display settings
    display: {
        count: 5,                    // Number of articles to display (1-20)
        enableCache: true,           // Enable caching
        cacheTTL: 3600,             // Cache time (seconds)
        showThumbnails: true,        // Show thumbnails
        showExcerpts: true          // Show excerpts
    },
    
    // 【Optional】Language settings
    i18n: {
        locale: 'zh-CN',            // Interface language: en, zh-CN, zh-TW, ja
        customMessages: {}           // Custom translations
    }
};
```

### Container Attribute Configuration

```html
<div id="chiral-connector-related-posts" 
     data-post-url="https://blog.com/post-title"    <!-- Current post URL -->
     data-hub-url="https://hub.example.com"         <!-- Hub address -->
     data-count="5">                                <!-- Display count -->
    Loading related Chiral data...
</div>
```

## 🔧 Platform Integration Methods

### Hugo Integration (Verified✔)

#### Method 1: Global Configuration

Add to `hugo.toml`:

```toml
[params]
  [params.chiral]
    enable = true
    hubUrl = "https://yourhub.com"
    count = 5
```

Create `layouts/partials/chiral-related.html`:

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

<!-- Use data attributes initialization -->
<script src="{{ $chiralJS.RelPermalink }}" 
        data-container="chiral-connector-related-posts" 
        data-hub-url="{{ .Site.Params.chiral.hubUrl }}" 
        data-count="{{ .Site.Params.chiral.count | default 5 }}" 
        data-auto-init="true"></script>
{{ end }}
```

Call in single post template (single.html):

```html
{{ partial "chiral-related.html" . }}
```

#### Method 2: Direct Use in Template

Add to `layouts/_default/single.html`:

```html
<!-- After post content -->
{{ .Content }}

<!-- Chiral related posts -->
<link rel="stylesheet" href="{{ "/assets/chiral-client.min.css" | relURL }}">

<div id="chiral-connector-related-posts" 
     data-post-url="{{ .Permalink }}">
    Loading related Chiral data...
</div>

<!-- Use data attributes initialization -->
<script src="{{ "/assets/chiral-client.min.js" | relURL }}" 
        data-container="chiral-connector-related-posts" 
        data-hub-url="https://your-hub.com" 
        data-count="5" 
        data-auto-init="true"></script>
```

### Jekyll Integration (Unverified)

Add to `_config.yml`:

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  count: 5
```

Create `_includes/chiral-related.html`:

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

Call in post layout:

```html
<!-- _layouts/post.html -->
{{ content }}

{% include chiral-related.html %}
```

### Hexo Integration (Verified✔)

Create `chiral-related.ejs` in theme's `layout/_partial/` directory:

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

Add to theme config `_config.yml`:

```yaml
chiral:
  enable: true
  hubUrl: "https://your-hub.com"
  count: 5
```

Include in post template:

```html
<!-- layout/post.ejs -->
<%- partial('_partial/chiral-related') %>
```

### VuePress Integration (Unverified)

Create `.vuepress/components/ChiralRelated.vue`:

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
    // Dynamically load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/assets/chiral-client.min.css';
    document.head.appendChild(css);
    
    // Configure client
    window.ChiralConfig = {
      hubUrl: this.hubUrl
    };
    
    // Dynamically load JS
    const script = document.createElement('script');
    script.src = '/assets/chiral-client.min.js';
    document.body.appendChild(script);
  }
};
</script>
```

Use in articles:

```markdown
# My Article

Article content...

<ChiralRelated />
```

## 🎨 Style Customization

### Basic Style Override

```css
/* Custom related posts title */
.chiral-connector-related-posts-list h3 {
    color: #your-color;
    font-size: 1.5em;
}

/* Custom post item styles */
.chiral-connector-related-posts-list li {
    border-left: 3px solid #your-accent-color;
    padding-left: 15px;
}

/* Custom thumbnails */
.related-post-thumbnail img {
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.related-post-thumbnail img:hover {
    transform: scale(1.05);
}
```

### Dark Mode Support

Client has built-in dark mode support, or you can manually override:

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

## 🔍 Troubleshooting

### Common Issues

**Q: Shows "Page data not found in Chiral network"**
- **Cause**: Your blog posts haven't been crawled by Hub's RSS crawler yet
- **Solution**: Wait for Hub crawling, or contact Hub admin to manually trigger crawling

**Q: Shows "Chiral Client configuration error"**
- **Cause**: Configuration parameters error
- **Solution**: Check if `hubUrl` is correct and accessible

**Q: Network errors in console**
- **Cause**: Hub address inaccessible or network issues
- **Solution**: Confirm Hub address is correct, check network connection

**Q: Style display issues**
- **Cause**: CSS file not loaded correctly or overridden by other styles
- **Solution**: Confirm CSS file path, adjust style priority

### Debug Tools

Open browser developer tools and enter in console:

```javascript
// View client info
window.chiralClientInstance.getInfo()

// View cache stats
window.chiralClientInstance.getCacheStats()

// Test connection
window.chiralClientInstance.testConnection()

// Clear cache
window.chiralClientInstance.clearCache()
```

### View Logs

Client outputs detailed logs in console:

```javascript
// Enable detailed logging
localStorage.setItem('chiral_debug', 'true');

// Disable logging
localStorage.removeItem('chiral_debug');
```

## 📊 Performance Optimization

### Cache Settings

```javascript
window.ChiralConfig = {
    display: {
        enableCache: true,
        cacheTTL: 43200  // 12-hour cache, reduce API calls
    }
};
```

### Lazy Loading

Load client only when needed:

```javascript
// Check if it's a post page
if (document.getElementById('chiral-connector-related-posts')) {
    // Dynamically load client
    const script = document.createElement('script');
    script.src = '/assets/chiral-client.min.js';
    document.body.appendChild(script);
}
```

---

## 🚀 Advanced Features

### Programmatic API

Besides auto-initialization, you can also use the client programmatically:

```javascript
// Manual client initialization
const client = ChiralClient.init({
    hubUrl: 'https://your-hub.com'
});

// Get related posts for specific URL
client.getRelatedPosts('https://blog.com/post', 5)
    .then(posts => console.log('Related posts:', posts));

// Test connection
client.testConnection()
    .then(connected => console.log('Connected:', connected));
```

### Event Listeners

```javascript
// Listen for client ready event
window.addEventListener('chiralClientReady', function(event) {
    console.log('Chiral Client ready:', event.detail);
});

// Listen for data loaded event
window.addEventListener('chiralDataLoaded', function(event) {
    console.log('Posts loaded:', event.detail.posts.length);
});
```

### Cache Management

```javascript
// Get cache stats
const stats = window.chiralClientInstance.getCacheStats();
console.log('Cache stats:', stats);

// Clean expired cache
const cleaned = window.chiralClientInstance.cleanExpiredCache();
console.log('Cleaned items:', cleaned);
```

---

🎉 **Congratulations!** You have successfully connected your blog to the Chiral network. Now your readers can discover more related quality content! 