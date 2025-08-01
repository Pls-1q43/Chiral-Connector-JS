<template>
  <div v-if="enabled" class="chiral-related-wrapper">
    <!-- Chiral Related Posts Container -->
    <div 
      id="chiral-connector-related-posts" 
      class="chiral-connector-related-posts-container"
      :data-post-url="postUrl"
      :data-node-id="nodeId"
      :data-hub-url="hubUrl"
      :data-count="count">
      Loading related Chiral data...
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChiralRelated',
  props: {
    // Override default config if needed
    hubUrl: {
      type: String,
      default: null
    },
    nodeId: {
      type: String,
      default: null
    },
    count: {
      type: Number,
      default: null
    }
  },
  computed: {
    enabled() {
      const config = this.$site.themeConfig.chiral || {};
      return config.enable || false;
    },
    postUrl() {
      // Get current page URL
      if (typeof window !== 'undefined') {
        return window.location.href;
      }
      return this.$page.path;
    },
    actualHubUrl() {
      return this.hubUrl || this.$site.themeConfig.chiral?.hubUrl || '';
    },
    actualNodeId() {
      return this.nodeId || this.$site.themeConfig.chiral?.nodeId || '';
    },
    actualCount() {
      return this.count || this.$site.themeConfig.chiral?.count || 5;
    }
  },
  mounted() {
    if (this.enabled) {
      this.loadChiralClient();
    }
  },
  methods: {
    async loadChiralClient() {
      // Load CSS
      if (!document.querySelector('link[href*="chiral-client.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://cdn.chiral-network.com/static-client/v1/chiral-client.css';
        document.head.appendChild(cssLink);
      }

      // Set global config
      const config = this.$site.themeConfig.chiral || {};
      window.ChiralConfig = {
        hubUrl: this.actualHubUrl,
        nodeId: this.actualNodeId,
        i18n: {
          locale: config.locale || 'en'
        },
        display: {
          count: this.actualCount,
          enableCache: config.enableCache !== false,
          cacheTTL: config.cacheTTL || 3600,
          showThumbnails: config.showThumbnails !== false,
          showExcerpts: config.showExcerpts !== false
        }
      };

      // Load JavaScript
      if (!document.querySelector('script[src*="chiral-client.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.chiral-network.com/static-client/v1/chiral-client.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
  }
}
</script>

<style scoped>
.chiral-related-wrapper {
  margin-top: 2rem;
}
</style>

<!--
  Usage Instructions:
  
  1. Save this file as .vuepress/components/ChiralRelated.vue
  2. Use in your markdown files: <ChiralRelated />
  3. Configure in .vuepress/config.js:
  
  module.exports = {
    themeConfig: {
      chiral: {
        enable: true,
        hubUrl: "https://your-hub.com",
        nodeId: "your-vuepress-blog",
        locale: "en",  // Optional: en, zh-CN, zh-TW, ja
        count: 5,      // Optional: number of related posts
        enableCache: true,     // Optional: enable browser caching
        cacheTTL: 3600,       // Optional: cache TTL in seconds
        showThumbnails: true, // Optional: show post thumbnails
        showExcerpts: true    // Optional: show post excerpts
      }
    }
  }
  
  You can also override settings per component:
  <ChiralRelated :count="3" hubUrl="https://different-hub.com" />
--> 