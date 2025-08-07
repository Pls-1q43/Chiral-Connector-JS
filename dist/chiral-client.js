/**
 * Chiral Static Client - Complete Bundle
 * 
 * Version: 1.0.0
 * Build: 2025-08-07T07:03:36.638Z
 * Mode: production
 * 
 * This file contains all necessary modules for the Chiral Static Client.
 * It can be included directly in static sites without any build process.
 */


/* === utils.js === */
/**
 * Utility Functions for Chiral Static Client
 * 
 * Provides common utility functions used across the client modules.
 */

class ChiralUtils {
    /**
     * Debounce function to limit the rate at which a function can fire
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Whether to execute immediately
     * @returns {Function} Debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function to limit function calls to once per specified interval
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function(...args) {
            if (!lastRan) {
                func.apply(this, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => ChiralUtils.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = ChiralUtils.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
        return obj;
    }

    /**
     * Check if a value is empty (null, undefined, empty string, empty array, empty object)
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Generate a random string
     * @param {number} length - Length of the string
     * @param {string} charset - Character set to use
     * @returns {string} Random string
     */
    static randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * Format date to a readable string
     * @param {Date|string} date - Date to format
     * @param {string} locale - Locale for formatting
     * @returns {string} Formatted date string
     */
    static formatDate(date, locale = 'en-US') {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (e.g., '...')
     * @returns {string} Truncated text
     */
    static truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL to extract domain from
     * @returns {string} Domain or empty string
     */
    static extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            return '';
        }
    }

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Parse query string to object
     * @param {string} queryString - Query string (with or without leading ?)
     * @returns {Object} Parsed query parameters
     */
    static parseQueryString(queryString) {
        const params = {};
        const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
        
        if (!query) return params;
        
        const pairs = query.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        }
        
        return params;
    }

    /**
     * Convert object to query string
     * @param {Object} params - Parameters object
     * @returns {string} Query string (without leading ?)
     */
    static objectToQueryString(params) {
        const pairs = [];
        for (const key in params) {
            if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
                pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
            }
        }
        return pairs.join('&');
    }

    /**
     * Get current page URL (handles different environments)
     * @returns {string} Current page URL
     */
    static getCurrentPageUrl() {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.href;
        }
        return '';
    }

    /**
     * Log message with timestamp and level
     * @param {string} message - Message to log
     * @param {string} level - Log level (debug, info, warn, error)
     * @param {*} data - Additional data to log
     */
    static log(message, level = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [Chiral Static Client] [${level.toUpperCase()}]`;
        
        switch (level.toLowerCase()) {
            case 'debug':
                if (data) {
                    console.debug(prefix, message, data);
                } else {
                    console.debug(prefix, message);
                }
                break;
            case 'info':
                if (data) {
                    console.info(prefix, message, data);
                } else {
                    console.info(prefix, message);
                }
                break;
            case 'warn':
                if (data) {
                    console.warn(prefix, message, data);
                } else {
                    console.warn(prefix, message);
                }
                break;
            case 'error':
                if (data) {
                    console.error(prefix, message, data);
                } else {
                    console.error(prefix, message);
                }
                break;
            default:
                if (data) {
                    console.log(prefix, message, data);
                } else {
                    console.log(prefix, message);
                }
        }
    }

    /**
     * Get user agent information
     * @returns {Object} User agent info
     */
    static getUserAgent() {
        if (typeof navigator === 'undefined') {
            return { browser: 'unknown', version: 'unknown', platform: 'unknown' };
        }

        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        let version = 'unknown';
        
        // Simple browser detection
        if (userAgent.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            const match = userAgent.match(/Chrome\/([0-9.]+)/);
            if (match) version = match[1];
        } else if (userAgent.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            const match = userAgent.match(/Firefox\/([0-9.]+)/);
            if (match) version = match[1];
        } else if (userAgent.indexOf('Safari') > -1) {
            browser = 'Safari';
            const match = userAgent.match(/Version\/([0-9.]+)/);
            if (match) version = match[1];
        } else if (userAgent.indexOf('Edge') > -1) {
            browser = 'Edge';
            const match = userAgent.match(/Edge\/([0-9.]+)/);
            if (match) version = match[1];
        }

        return {
            browser: browser,
            version: version,
            platform: navigator.platform || 'unknown',
            userAgent: userAgent
        };
    }

    /**
     * Wait for DOM to be ready
     * @param {Function} callback - Callback to execute when DOM is ready
     */
    static ready(callback) {
        if (typeof document === 'undefined') {
            callback();
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    /**
     * Create a simple hash from string (for cache keys, etc.)
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    static simpleHash(str) {
        let hash = 0;
        if (!str || str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    static isLocalStorageAvailable() {
        try {
            const testKey = '__chiral_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get viewport dimensions
     * @returns {Object} Viewport width and height
     */
    static getViewportSize() {
        if (typeof window === 'undefined') {
            return { width: 0, height: 0 };
        }

        return {
            width: window.innerWidth || document.documentElement.clientWidth || 0,
            height: window.innerHeight || document.documentElement.clientHeight || 0
        };
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChiralUtils;
} else if (typeof window !== 'undefined') {
    window.ChiralUtils = ChiralUtils;
} 

/* === cache.js === */
/**
 * Cache Module for Chiral Static Client
 * 
 * Provides localStorage-based caching functionality with TTL support.
 * Manages cache for related posts data to improve performance.
 */

class ChiralCache {
    constructor(prefix = 'chiral_static') {
        this.prefix = prefix;
        this.isAvailable = this.checkLocalStorageAvailability();
        
        if (!this.isAvailable) {
            console.warn('Chiral Cache: localStorage is not available, caching will be disabled');
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    checkLocalStorageAvailability() {
        try {
            const testKey = '__chiral_cache_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Generate cache key with prefix
     * @param {string} key - Cache key
     * @returns {string} Prefixed cache key
     */
    getCacheKey(key) {
        return `${this.prefix}_${key}`;
    }

    /**
     * Set cache item with TTL
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in seconds
     * @returns {boolean} True if successfully cached
     */
    set(key, data, ttl = 3600) {
        if (!this.isAvailable) return false;

        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                ttl: ttl * 1000 // Convert to milliseconds
            };
            
            const cacheKey = this.getCacheKey(key);
            localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
            return true;
        } catch (e) {
            console.warn('Chiral Cache: Failed to set cache item', e);
            return false;
        }
    }

    /**
     * Get cache item
     * @param {string} key - Cache key
     * @returns {*|null} Cached data or null if not found/expired
     */
    get(key) {
        if (!this.isAvailable) return null;

        try {
            const cacheKey = this.getCacheKey(key);
            const item = localStorage.getItem(cacheKey);
            
            if (!item) return null;
            
            const cacheItem = JSON.parse(item);
            const now = Date.now();
            
            // Check if item has expired
            if (now - cacheItem.timestamp > cacheItem.ttl) {
                this.remove(key);
                return null;
            }
            
            return cacheItem.data;
        } catch (e) {
            console.warn('Chiral Cache: Failed to get cache item', e);
            return null;
        }
    }

    /**
     * Remove cache item
     * @param {string} key - Cache key
     * @returns {boolean} True if successfully removed
     */
    remove(key) {
        if (!this.isAvailable) return false;

        try {
            const cacheKey = this.getCacheKey(key);
            localStorage.removeItem(cacheKey);
            return true;
        } catch (e) {
            console.warn('Chiral Cache: Failed to remove cache item', e);
            return false;
        }
    }

    /**
     * Clear all cache items with the prefix
     * @returns {number} Number of items cleared
     */
    clear() {
        if (!this.isAvailable) return 0;

        let cleared = 0;
        const keys = [];
        
        try {
            // Collect keys to avoid modification during iteration
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix + '_')) {
                    keys.push(key);
                }
            }
            
            // Remove collected keys
            keys.forEach(key => {
                localStorage.removeItem(key);
                cleared++;
            });
            
            return cleared;
        } catch (e) {
            console.warn('Chiral Cache: Failed to clear cache', e);
            return cleared;
        }
    }

    /**
     * Clean expired cache items
     * @returns {number} Number of expired items cleaned
     */
    cleanExpired() {
        if (!this.isAvailable) return 0;

        let cleaned = 0;
        const keys = [];
        const now = Date.now();
        
        try {
            // Collect cache keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix + '_')) {
                    keys.push(key);
                }
            }
            
            // Check each item for expiration
            keys.forEach(key => {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cacheItem = JSON.parse(item);
                        if (now - cacheItem.timestamp > cacheItem.ttl) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    }
                } catch (e) {
                    // If parsing fails, remove the corrupted item
                    localStorage.removeItem(key);
                    cleaned++;
                }
            });
            
            return cleaned;
        } catch (e) {
            console.warn('Chiral Cache: Failed to clean expired items', e);
            return cleaned;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        if (!this.isAvailable) {
            return {
                available: false,
                totalItems: 0,
                totalSize: 0,
                expiredItems: 0
            };
        }

        let totalItems = 0;
        let totalSize = 0;
        let expiredItems = 0;
        const now = Date.now();

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix + '_')) {
                    totalItems++;
                    const item = localStorage.getItem(key);
                    if (item) {
                        totalSize += item.length;
                        try {
                            const cacheItem = JSON.parse(item);
                            if (now - cacheItem.timestamp > cacheItem.ttl) {
                                expiredItems++;
                            }
                        } catch (e) {
                            expiredItems++; // Count corrupted items as expired
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Chiral Cache: Failed to get stats', e);
        }

        return {
            available: true,
            totalItems: totalItems,
            totalSize: totalSize,
            expiredItems: expiredItems
        };
    }

    /**
     * Generate cache key for related posts
     * @param {string} postUrl - Current post URL
     * @param {string} hubUrl - Hub URL
     * @param {number} count - Number of posts requested
     * @returns {string} Cache key
     */
    static generateRelatedPostsKey(postUrl, hubUrl, count) {
        // Create a simple hash of the parameters
        const hashInput = `${postUrl}|${hubUrl}|${count}`;
        return `related_posts_${ChiralCache.simpleHash(hashInput)}`;
    }

    /**
     * Simple hash function for generating cache keys
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    static simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(36);
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChiralCache;
} else if (typeof window !== 'undefined') {
    window.ChiralCache = ChiralCache;
} 

/* === config.js === */
/**
 * Configuration Management Module for Chiral Static Client
 * 
 * Handles configuration validation, normalization and defaults for the static client.
 * This module manages the simplified configuration required for display-only functionality.
 */

class ChiralConfig {
    constructor(userConfig = {}) {
        this.config = this.validateAndNormalize(userConfig);
    }

    /**
     * Validate and normalize user configuration
     * @param {Object} userConfig - User-provided configuration
     * @returns {Object} Normalized configuration
     */
    validateAndNormalize(userConfig) {
        // Default configuration
        const defaults = {
            // Required settings
            hubUrl: '',
            
            // Container settings
            containerId: 'chiral-related-posts',
            
            // Display settings
            display: {
                count: 5,
                enableCache: true,
                cacheTTL: 3600, // 1 hour in seconds
                showThumbnails: true,
                showExcerpts: true
            },
            
            // Internationalization settings
            i18n: {
                locale: 'en',
                fallbackLocale: 'en',
                customMessages: {}
            }
        };

        // Merge user config with defaults
        const config = this.deepMerge(defaults, userConfig);

        // Validate required fields
        if (!config.hubUrl || typeof config.hubUrl !== 'string' || config.hubUrl.trim() === '') {
            console.error('Config validation failed - hubUrl:', config.hubUrl, 'type:', typeof config.hubUrl);
            console.error('Full config object:', config);
            throw new Error('Chiral Static Client: hubUrl is required and cannot be empty');
        }

        // Clean up hubUrl (remove trailing slash)
        config.hubUrl = config.hubUrl.replace(/\/+$/, '');

        // Validate hubUrl format
        try {
            new URL(config.hubUrl);
        } catch (e) {
            throw new Error('Chiral Static Client: hubUrl must be a valid URL');
        }

        // Normalize display settings
        config.display.count = Math.max(1, Math.min(20, parseInt(config.display.count) || 5));
        config.display.cacheTTL = Math.max(60, parseInt(config.display.cacheTTL) || 3600);
        config.display.enableCache = Boolean(config.display.enableCache);
        config.display.showThumbnails = Boolean(config.display.showThumbnails);
        config.display.showExcerpts = Boolean(config.display.showExcerpts);

        // Normalize i18n settings
        config.i18n.locale = this.normalizeLocale(config.i18n.locale || 'en');
        config.i18n.fallbackLocale = this.normalizeLocale(config.i18n.fallbackLocale || 'en');

        return config;
    }

    /**
     * Deep merge two objects
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    /**
     * Normalize locale code to supported format
     * @param {string} locale - Locale code
     * @returns {string} Normalized locale code
     */
    normalizeLocale(locale) {
        if (!locale || typeof locale !== 'string') {
            return 'en';
        }

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

    /**
     * Get Hub domain from Hub URL
     * @returns {string} Hub domain
     */
    getHubDomain() {
        try {
            return new URL(this.config.hubUrl).hostname;
        } catch (e) {
            return '';
        }
    }

    /**
     * Get configuration value by path
     * @param {string} path - Configuration path (e.g., 'display.count')
     * @returns {*} Configuration value
     */
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    /**
     * Get all configuration
     * @returns {Object} Full configuration object
     */
    getAll() {
        return { ...this.config };
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChiralConfig;
} else if (typeof window !== 'undefined') {
    window.ChiralConfig = ChiralConfig;
} 

/* === i18n.js === */
/**
 * Internationalization Module for Chiral Static Client
 * 
 * Provides translation functionality with built-in language packs aligned with Chiral-Connector.
 * Supports English, Simplified Chinese, Traditional Chinese, and Japanese.
 */

// Built-in language packs (aligned with Chiral-Connector)
const CHIRAL_I18N_MESSAGES = {
    'en': {
        'loading': 'Loading related Chiral data...',
        'relatedTitle': 'Related Content',
        'noData': 'No related Chiral data found at the moment.',
        'fetchError': 'Error fetching related data',
        'configError': 'Chiral Connector: Configuration error for related posts.',
        'source': 'Source: {0}',
        'fromChiralNetwork': 'From Chiral Network: {0}',
        'cptNotFound': 'Page data not found in Chiral network',
        'networkError': 'Network connection error'
    },
    'zh-CN': {
        'loading': '正在加载相关 Chiral 数据...',
        'relatedTitle': '相关内容',
        'noData': '暂时没有找到相关 Chiral 数据。',
        'fetchError': '获取相关数据时出错',
        'configError': 'Chiral Connector：相关文章配置错误。',
        'source': '来源：{0}',
        'fromChiralNetwork': '来自 Chiral 网络：{0}',
        'cptNotFound': '在 Chiral 网络中未找到页面数据',
        'networkError': '网络连接错误'
    },
    'zh-TW': {
        'loading': '正在載入相關 Chiral 資料...',
        'relatedTitle': '相關內容',
        'noData': '暫時沒有找到相關 Chiral 資料。',
        'fetchError': '獲取相關資料時出錯',
        'configError': 'Chiral Connector：相關文章配置錯誤。',
        'source': '來源：{0}',
        'fromChiralNetwork': '來自 Chiral 網路：{0}',
        'cptNotFound': '在 Chiral 網路中未找到頁面資料',
        'networkError': '網路連線錯誤'
    },
    'ja': {
        'loading': '関連 Chiral データを読み込み中...',
        'relatedTitle': '関連コンテンツ',
        'noData': '関連 Chiral データが見つかりませんでした。',
        'fetchError': '関連データの取得エラー',
        'configError': 'Chiral Connector：関連記事の設定エラー。',
        'source': 'ソース：{0}',
        'fromChiralNetwork': 'Chiral ネットワークから：{0}',
        'cptNotFound': 'Chiral ネットワークにページデータが見つかりません',
        'networkError': 'ネットワーク接続エラー'
    }
};

class ChiralI18n {
    constructor(locale = 'en', customMessages = {}) {
        this.locale = this.normalizeLocale(locale);
        this.fallbackLocale = 'en';
        this.messages = this.mergeMessages(CHIRAL_I18N_MESSAGES, customMessages);
    }

    /**
     * Set the current locale
     * @param {string} locale - Locale code
     */
    setLocale(locale) {
        this.locale = this.normalizeLocale(locale);
    }

    /**
     * Get translated text
     * @param {string} key - Translation key
     * @param {Array} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = []) {
        let message = this.getMessage(key, this.locale);
        
        // If not found in current locale, try fallback locale
        if (!message && this.locale !== this.fallbackLocale) {
            message = this.getMessage(key, this.fallbackLocale);
        }
        
        // If still not found, return the key itself
        if (!message) {
            console.warn(`Chiral I18n: Translation key "${key}" not found for locale "${this.locale}"`);
            return key;
        }

        // Handle parameter interpolation {0}, {1}, etc.
        return this.interpolate(message, params);
    }

    /**
     * Get message for specific locale
     * @param {string} key - Translation key
     * @param {string} locale - Locale code
     * @returns {string|null} Message or null if not found
     */
    getMessage(key, locale) {
        const localeMessages = this.messages[locale];
        if (!localeMessages) return null;
        
        // Support nested keys like 'error.network'
        return key.split('.').reduce((obj, keyPart) => {
            return obj && obj[keyPart];
        }, localeMessages);
    }

    /**
     * Interpolate parameters into message
     * @param {string} message - Message template
     * @param {Array} params - Parameters to interpolate
     * @returns {string} Interpolated message
     */
    interpolate(message, params) {
        return message.replace(/\{(\d+)\}/g, (match, index) => {
            return params[index] !== undefined ? params[index] : match;
        });
    }

    /**
     * Merge custom messages with built-in messages
     * @param {Object} builtinMessages - Built-in message object
     * @param {Object} customMessages - Custom message object
     * @returns {Object} Merged messages
     */
    mergeMessages(builtinMessages, customMessages) {
        const messages = JSON.parse(JSON.stringify(builtinMessages)); // Deep clone
        
        // Merge custom messages
        Object.keys(customMessages).forEach(locale => {
            if (!messages[locale]) {
                messages[locale] = {};
            }
            Object.assign(messages[locale], customMessages[locale]);
        });
        
        return messages;
    }

    /**
     * Normalize locale code
     * @param {string} locale - Locale code
     * @returns {string} Normalized locale code
     */
    normalizeLocale(locale) {
        if (!locale || typeof locale !== 'string') {
            return 'en';
        }

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

    /**
     * Get configured locale from configuration
     * @param {Object} config - Configuration object
     * @returns {string} Configured locale
     */
    static getConfiguredLocale(config) {
        return config.i18n?.locale || 'en';
    }

    /**
     * Get all available locales
     * @returns {Array} Array of available locale codes
     */
    getAvailableLocales() {
        return Object.keys(this.messages);
    }

    /**
     * Check if a locale is supported
     * @param {string} locale - Locale code to check
     * @returns {boolean} True if supported
     */
    isLocaleSupported(locale) {
        return this.messages.hasOwnProperty(this.normalizeLocale(locale));
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChiralI18n, CHIRAL_I18N_MESSAGES };
} else if (typeof window !== 'undefined') {
    window.ChiralI18n = ChiralI18n;
    window.CHIRAL_I18N_MESSAGES = CHIRAL_I18N_MESSAGES;
} 

/* === api.js === */
/**
 * API Module for Chiral Static Client
 * 
 * Handles all API communications with Chiral Hub API endpoints.
 * Uses domain-based validation instead of nodeId authentication.
 */

class ChiralAPI {
    constructor(hubUrl) {
        this.hubUrl = hubUrl ? hubUrl.replace(/\/+$/, '') : '';
        this.hubDomain = this.extractDomain(this.hubUrl);
        
        if (!this.hubUrl) {
            throw new Error('Chiral API: hubUrl is required');
        }
    }

    /**
     * Extract domain from URL
     * @param {string} url - URL to extract domain from
     * @returns {string} Domain or empty string
     */
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            console.warn('Chiral API: Invalid URL format', url);
            return '';
        }
    }









    /**
     * Find CPT ID for current page URL
     * Searches for chiral_data posts with matching chiral_source_url meta
     * @param {string} currentPageUrl - Current page URL
     * @returns {Promise<number|null>} CPT ID or null if not found
     */
    async findCptId(currentPageUrl) {
        if (!currentPageUrl || !this.hubDomain) {
            throw new Error('Chiral API: Missing currentPageUrl or hubDomain');
        }

        const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(this.hubDomain)}/posts`;
        const params = new URLSearchParams({
            type: 'chiral_data',
            meta_key: 'chiral_source_url',
            meta_value: currentPageUrl,
            _fields: 'ID',
            number: 1 // We only need the first match
        });

        try {
            const response = await fetch(`${apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                referrerPolicy: 'origin-when-cross-origin'
            });

            if (!response.ok) {
                throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
                return data.posts[0].ID;
            }
            
            return null; // No matching CPT found
        } catch (error) {
            console.warn('Chiral API: Failed to find CPT ID', error);
            throw new Error(`Failed to find page data in Chiral network: ${error.message}`);
        }
    }

    /**
     * Get related post IDs from Hub proxy endpoint
     * Uses Hub as proxy to avoid CORS issues with POST requests
     * @param {number} cptId - CPT ID
     * @param {number} count - Number of related posts to fetch
     * @returns {Promise<Array>} Array of related post IDs
     */
    async getRelatedPostIdsFromHub(cptId, count = 5) {
        try {
            const apiUrl = `${this.hubUrl}/wp-json/chiral-network/v1/related-post-ids`;
            const params = new URLSearchParams({
                cpt_id: cptId.toString(),
                count: count.toString()
            });

            const response = await fetch(`${apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                // Ensure Referer header is sent
                referrerPolicy: 'origin-when-cross-origin'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                } else if (response.status === 403) {
                    throw new Error('Domain not authorized in Chiral network');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            return data.related_post_ids || [];
            
        } catch (error) {
            console.warn('Chiral API: Failed to get related post IDs from Hub', error);
            throw error;
        }
    }

    /**
     * Get post details from WordPress.com API
     * @param {string} siteIdentifier - Site domain
     * @param {number} postId - Post ID
     * @returns {Promise<Object>} Post details object
     */
    async getPostDetailsFromWpApi(siteIdentifier, postId) {
        const fields = 'ID,title,URL,excerpt,date,featured_image,tags,categories,author,metadata';
        const apiUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(siteIdentifier)}/posts/${postId}`;
        const params = new URLSearchParams({ fields });

        try {
            const response = await fetch(`${apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                referrerPolicy: 'origin-when-cross-origin'
            });

            if (!response.ok) {
                throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data && data.ID) {
                return data;
            } else {
                throw new Error('Invalid post data received');
            }
        } catch (error) {
            console.warn('Chiral API: Failed to get post details', error);
            throw new Error(`Failed to fetch post details: ${error.message}`);
        }
    }

    /**
     * Get related posts for current page
     * Uses hybrid approach: direct WordPress.com API for CPT finding and post details,
     * Hub proxy only for the related posts query (which requires POST)
     * @param {string} currentPageUrl - Current page URL
     * @param {number} count - Number of related posts to fetch
     * @returns {Promise<Array>} Array of related post objects
     */
    async getRelatedPosts(currentPageUrl, count = 5) {
        try {
            // Step 1: Find the CPT ID for current page (direct WordPress.com API call)
            const cptId = await this.findCptId(currentPageUrl);
            
            if (!cptId) {
                throw new Error('Page data not found in Chiral network');
            }

            // Step 2: Get related post IDs using Hub proxy (resolves POST CORS issue)
            const relatedPostIds = await this.getRelatedPostIdsFromHub(cptId, count);
            
            if (!relatedPostIds || relatedPostIds.length === 0) {
                return []; // No related posts found
            }

            // Step 3: Get detailed information for each related post (direct WordPress.com API calls)
            const relatedPosts = [];
            const fetchPromises = relatedPostIds.map(async (postId) => {
                try {
                    const postDetails = await this.getPostDetailsFromWpApi(this.hubDomain, postId);
                    return this.normalizePostData(postDetails);
                } catch (error) {
                    console.warn('Chiral API: Failed to fetch details for post', postId, error);
                    return null; // Skip this post
                }
            });

            const results = await Promise.all(fetchPromises);
            
            // Filter out null results and return up to requested count
            return results.filter(post => post !== null).slice(0, count);
            
        } catch (error) {
            console.warn('Chiral API: Failed to get related posts', error);
            throw error;
        }
    }

    /**
     * Normalize post data from WordPress.com API
     * Ensures consistent data structure for display
     * @param {Object} postData - Raw post data from WordPress.com API
     * @returns {Object} Normalized post data
     */
    normalizePostData(postData) {
        // Extract chiral_source_url from metadata
        let sourceUrl = postData.URL || '#';
        if (postData.metadata && Array.isArray(postData.metadata)) {
            const chiralSourceMeta = postData.metadata.find(meta => meta.key === 'chiral_source_url');
            if (chiralSourceMeta && chiralSourceMeta.value) {
                sourceUrl = chiralSourceMeta.value;
            }
        }

        return {
            id: postData.ID,
            title: postData.title || 'Untitled',
            url: sourceUrl,
            excerpt: postData.excerpt ? this.stripHtmlTags(postData.excerpt) : '',
            featured_image_url: postData.featured_image || null,
            date: postData.date || null,
            author_name: postData.author?.name || 'N/A',
            metadata: postData.metadata || [],
            // Add network name for subtitle display
            network_name: this.extractNetworkName()
        };
    }

    /**
     * Extract network name from Hub domain
     * @returns {string} Network name
     */
    extractNetworkName() {
        // Extract domain from Hub URL for network name
        try {
            const domain = new URL(this.hubUrl).hostname;
            return domain || 'Chiral Network';
        } catch (e) {
            return 'Chiral Network';
        }
    }

    /**
     * Strip HTML tags from text
     * @param {string} html - HTML text
     * @returns {string} Plain text
     */
    stripHtmlTags(html) {
        if (!html || typeof html !== 'string') return '';
        
        // Create a temporary element to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    /**
     * Test connection to Chiral Hub API
     * Tests if the Hub's related-post-ids endpoint is accessible
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            // Test the related-post-ids endpoint with a dummy CPT ID
            const apiUrl = `${this.hubUrl}/wp-json/chiral-network/v1/related-post-ids`;
            const params = new URLSearchParams({
                cpt_id: '1', // Dummy ID for testing
                count: '1'
            });

            const response = await fetch(`${apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                referrerPolicy: 'origin-when-cross-origin'
            });

            // Any response (even 404 or 403) indicates the endpoint exists
            return response.status !== 0; // 0 typically indicates network error
        } catch (error) {
            console.warn('Chiral API: Connection test failed', error);
            return false;
        }
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChiralAPI;
} else if (typeof window !== 'undefined') {
    window.ChiralAPI = ChiralAPI;
} 

/* === display.js === */
/**
 * Display Module for Chiral Static Client
 * 
 * Handles all display logic for related posts. Ported from Chiral-Connector's 
 * JavaScript display logic with adaptations for static sites.
 */

class ChiralDisplay {
    constructor(config) {
        if (!config) {
            throw new Error('Chiral Display: Configuration is required');
        }

        this.config = new ChiralConfig(config);
        this.api = new ChiralAPI(this.config.get('hubUrl'));
        this.cache = new ChiralCache('chiral_static');
        
        // Initialize i18n
        this.initI18n();
    }

    /**
     * Initialize internationalization
     */
    initI18n() {
        const locale = ChiralI18n.getConfiguredLocale(this.config.getAll());
        const normalizedLocale = ChiralI18n.prototype.normalizeLocale(locale);
        const customMessages = this.config.get('i18n.customMessages') || {};
        
        this.i18n = new ChiralI18n(normalizedLocale, customMessages);
    }

    /**
     * Initialize display functionality
     * Main entry point for the display system
     */
    async init() {
        // Support both old and new container IDs
        const selectors = [
            '#chiral-connector-related-posts',
            '#chiral-related-posts'
        ];
        
        // If a specific container ID is configured, use that
        const containerId = this.config.get('containerId');
        if (containerId) {
            selectors.unshift(`#${containerId}`);
        }
        
        let containers = [];
        for (const selector of selectors) {
            const found = document.querySelectorAll(selector);
            containers = containers.concat(Array.from(found));
        }
        
        if (containers.length === 0) {
            console.warn('Chiral Display: No containers found with selectors:', selectors);
            return;
        }

        // Process each container
        for (const container of containers) {
            try {
                await this.loadAndRenderRelatedPosts(container);
            } catch (error) {
                console.error('Chiral Display: Failed to process container', error);
                this.renderErrorState(container, error);
            }
        }
    }

    /**
     * Load and render related posts for a container
     * @param {Element} container - DOM container element
     */
    async loadAndRenderRelatedPosts(container) {
        // Extract configuration from data attributes
        const postUrl = container.dataset.postUrl || window.location.href;
        const hubUrl = container.dataset.hubUrl || this.config.get('hubUrl');
        const count = parseInt(container.dataset.count) || this.config.get('display.count');

        if (!postUrl || !hubUrl) {
            throw new Error(this.i18n.t('configError'));
        }

        // Show loading state
        this.renderLoadingState(container);

        try {
            // Check cache first
            let relatedPosts = null;
            const enableCache = this.config.get('display.enableCache');
            
            if (enableCache) {
                const cacheKey = ChiralCache.generateRelatedPostsKey(postUrl, hubUrl, count);
                relatedPosts = this.cache.get(cacheKey);
                
                if (relatedPosts) {
                    console.log('Chiral Display: Using cached data');
                    this.renderRelatedPosts(container, relatedPosts, hubUrl);
                    return;
                }
            }

            // Fetch from API
            relatedPosts = await this.api.getRelatedPosts(postUrl, count);

            // Cache the results
            if (enableCache && relatedPosts) {
                const cacheKey = ChiralCache.generateRelatedPostsKey(postUrl, hubUrl, count);
                const cacheTTL = this.config.get('display.cacheTTL');
                this.cache.set(cacheKey, relatedPosts, cacheTTL);
            }

            // Render the results
            if (relatedPosts && relatedPosts.length > 0) {
                this.renderRelatedPosts(container, relatedPosts, hubUrl);
            } else {
                this.renderNoDataState(container, hubUrl);
            }

        } catch (error) {
            console.warn('Chiral Display: Failed to load related posts', error);
            
            // Check if it's a "CPT not found" error
            if (error.message.includes('Page data not found')) {
                this.renderCptNotFoundState(container, hubUrl);
            } else {
                this.renderErrorState(container, error);
            }
        }
    }

    /**
     * Render loading state
     * @param {Element} container - DOM container
     */
    renderLoadingState(container) {
        container.innerHTML = `<p class="chiral-loading">${this.i18n.t('loading')}</p>`;
    }

    /**
     * Render no data state
     * @param {Element} container - DOM container
     * @param {string} hubUrl - Hub URL for subtitle
     */
    renderNoDataState(container, hubUrl) {
        const subtitleHtml = this.generateSubtitleHtml(hubUrl, null);
        const html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                ${subtitleHtml}
                <p class="chiral-no-related-posts">${this.i18n.t('noData')}</p>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render CPT not found state
     * @param {Element} container - DOM container  
     * @param {string} hubUrl - Hub URL for subtitle
     */
    renderCptNotFoundState(container, hubUrl) {
        const subtitleHtml = this.generateSubtitleHtml(hubUrl, null);
        const html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                ${subtitleHtml}
                <p class="chiral-no-related-posts">${this.i18n.t('cptNotFound')}</p>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render error state
     * @param {Element} container - DOM container
     * @param {Error} error - Error object
     */
    renderErrorState(container, error) {
        const errorMsg = `${this.i18n.t('fetchError')}: ${error.message}`;
        const html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                <p class="chiral-no-related-posts">${this.escapeHtml(errorMsg)}</p>
            </div>
        `;
        container.innerHTML = html;
    }

    /**
     * Render related posts
     * @param {Element} container - DOM container
     * @param {Array} relatedPosts - Array of related post objects
     * @param {string} hubUrl - Hub URL for subtitle and source detection
     */
    renderRelatedPosts(container, relatedPosts, hubUrl) {
        const subtitleHtml = this.generateSubtitleHtml(hubUrl, relatedPosts[0]);
        
        let html = `
            <div class="chiral-connector-related-posts-list">
                <h3>${this.i18n.t('relatedTitle')}</h3>
                ${subtitleHtml}
                <ul>
        `;

        relatedPosts.forEach(post => {
            html += this.renderRelatedPostItem(post, hubUrl);
        });

        html += `
                </ul>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render a single related post item
     * Ported from Chiral-Connector's renderRelatedPostItem function
     * @param {Object} post - Post object
     * @param {string} hubUrl - Hub URL for source detection
     * @returns {string} HTML string for the post item
     */
    renderRelatedPostItem(post, hubUrl) {
        const showThumbnails = this.config.get('display.showThumbnails');
        const showExcerpts = this.config.get('display.showExcerpts');
        
        let itemHtml = '<li>';
        
        // Determine source URL
        const sourceUrl = post.url || '#';
        
        // Thumbnail
        if (showThumbnails && post.featured_image_url) {
            itemHtml += `
                <div class="related-post-thumbnail">
                    <a href="${this.escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">
                        <img src="${this.escapeHtml(post.featured_image_url)}" alt="${this.escapeHtml(post.title)}">
                    </a>
                </div>
            `;
        }

        // Content
        itemHtml += '<div class="related-post-content">';
        itemHtml += `<h4><a href="${this.escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(post.title)}</a></h4>`;
        
        // Excerpt
        if (showExcerpts && post.excerpt) {
            itemHtml += `<div class="related-post-excerpt">${this.escapeHtml(post.excerpt)}</div>`;
        }

        // Source label
        const sourceLabel = this.generateSourceLabel(post, hubUrl);
        if (sourceLabel) {
            itemHtml += `<small class="related-post-source">${sourceLabel}</small>`;
        }

        itemHtml += '</div>'; // .related-post-content
        itemHtml += '</li>';
        
        return itemHtml;
    }

    /**
     * Generate source label for a post
     * @param {Object} post - Post object
     * @param {string} hubUrl - Hub URL
     * @returns {string} Source label HTML
     */
    generateSourceLabel(post, hubUrl) {
        const isHubUrl = hubUrl && post.url && post.url.indexOf(hubUrl) === 0 && post.url.indexOf('/chiral_data/') > -1;
        
        // Priority: author_name > hub indicator > source hostname
        if (post.author_name && post.author_name !== 'N/A') {
            return this.i18n.t('source', [this.escapeHtml(post.author_name)]);
        } else if (isHubUrl) {
            try {
                const hubHostname = new URL(hubUrl).hostname;
                return this.i18n.t('source', [this.escapeHtml(hubHostname) + ' (Hub)']);
            } catch (e) {
                return this.i18n.t('source', ['Chiral Hub']);
            }
        } else if (post.url && post.url !== '#') {
            try {
                const sourceHostname = new URL(post.url).hostname;
                return this.i18n.t('source', [this.escapeHtml(sourceHostname)]);
            } catch (e) {
                return '';
            }
        }
        
        return '';
    }

    /**
     * Generate subtitle HTML for the network attribution
     * @param {string} hubUrl - Hub URL
     * @param {Object|null} firstPost - First post object for network name extraction
     * @returns {string} Subtitle HTML
     */
    generateSubtitleHtml(hubUrl, firstPost) {
        let networkName = 'Chiral Network';
        let hubLink = hubUrl;

        // Try to get network name from first post
        if (firstPost && firstPost.network_name) {
            networkName = firstPost.network_name;
        } else if (hubUrl) {
            try {
                networkName = new URL(hubUrl).hostname;
            } catch (e) {
                networkName = 'Chiral Network';
            }
        }

        if (hubLink && hubLink.trim() !== '') {
            return `<small class="chiral-hub-name-subtitle">${this.i18n.t('fromChiralNetwork', [`<a href="${this.escapeHtml(hubLink)}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(networkName)}</a>`])}</small>`;
        } else {
            return `<small class="chiral-hub-name-subtitle">${this.i18n.t('fromChiralNetwork', [this.escapeHtml(networkName)])}</small>`;
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for module systems or global use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChiralDisplay;
} else if (typeof window !== 'undefined') {
    window.ChiralDisplay = ChiralDisplay;
} 

/* === Main Entry Point === */
/**
 * Chiral Static Client - Main Entry Point
 * 
 * Provides a unified interface for the Chiral Static Client functionality.
 * Integrates all core modules and handles automatic initialization.
 * 
 * Version: 1.0.0
 * Author: Chiral Network Team
 */

(function(window) {
    'use strict';

    // Define the main ChiralClient class
    class ChiralClient {
        constructor(config = {}) {
            this.version = '1.0.0';
            this.isInitialized = false;
            
            try {
                // Initialize configuration
                this.config = new ChiralConfig(config);
                
                // Initialize core modules
                this.initializeModules();
                
                // Log initialization
                ChiralUtils.log('Chiral Static Client initialized', 'info', {
                    version: this.version,
                    config: this.config.getAll()
                });
                
                this.isInitialized = true;
            } catch (error) {
                ChiralUtils.log('Failed to initialize Chiral Static Client', 'error', error);
                throw error;
            }
        }

        /**
         * Initialize core modules
         */
        initializeModules() {
            // Initialize API
            this.api = new ChiralAPI(
                this.config.get('hubUrl')
            );

            // Initialize cache
            this.cache = new ChiralCache('chiral_static');

            // Initialize display
            this.display = new ChiralDisplay(this.config.getAll());

            // Initialize i18n
            const locale = ChiralI18n.getConfiguredLocale(this.config.getAll());
            const customMessages = this.config.get('i18n.customMessages') || {};
            this.i18n = new ChiralI18n(locale, customMessages);
        }

        /**
         * Start the client (main entry point)
         */
        async start() {
            if (!this.isInitialized) {
                throw new Error('Chiral Client: Not initialized');
            }

            try {
                ChiralUtils.log('Starting Chiral Static Client display', 'info');
                await this.display.init();
            } catch (error) {
                ChiralUtils.log('Failed to start Chiral Static Client', 'error', error);
                throw error;
            }
        }

        /**
         * Test connection to the Hub
         * @returns {Promise<boolean>} True if connection successful
         */
        async testConnection() {
            if (!this.isInitialized) {
                throw new Error('Chiral Client: Not initialized');
            }

            try {
                return await this.api.testConnection();
            } catch (error) {
                ChiralUtils.log('Connection test failed', 'error', error);
                return false;
            }
        }

        /**
         * Get related posts for a specific URL
         * @param {string} url - URL to get related posts for
         * @param {number} count - Number of posts to fetch
         * @returns {Promise<Array>} Array of related posts
         */
        async getRelatedPosts(url, count) {
            if (!this.isInitialized) {
                throw new Error('Chiral Client: Not initialized');
            }

            try {
                return await this.api.getRelatedPosts(url, count);
            } catch (error) {
                ChiralUtils.log('Failed to get related posts', 'error', error);
                throw error;
            }
        }

        /**
         * Clear cache
         * @returns {number} Number of items cleared
         */
        clearCache() {
            if (!this.isInitialized) {
                throw new Error('Chiral Client: Not initialized');
            }

            return this.cache.clear();
        }

        /**
         * Get cache statistics
         * @returns {Object} Cache statistics
         */
        getCacheStats() {
            if (!this.isInitialized) {
                throw new Error('Chiral Client: Not initialized');
            }

            return this.cache.getStats();
        }

        /**
         * Get client information
         * @returns {Object} Client information
         */
        getInfo() {
            return {
                version: this.version,
                initialized: this.isInitialized,
                config: this.isInitialized ? this.config.getAll() : null,
                userAgent: ChiralUtils.getUserAgent(),
                viewport: ChiralUtils.getViewportSize()
            };
        }
    }

    // Global initialization function
    function initializeChiralClient(config) {
        try {
            const client = new ChiralClient(config);
            
            // Store client instance globally for debugging
            window.chiralClientInstance = client;
            
            // Auto-start when DOM is ready
            ChiralUtils.ready(async () => {
                try {
                    await client.start();
                } catch (error) {
                    ChiralUtils.log('Auto-start failed', 'error', error);
                }
            });
            
            return client;
        } catch (error) {
            ChiralUtils.log('Failed to initialize client', 'error', error);
            throw error;
        }
    }



    // Expose public API
    window.ChiralClient = {
        // Main class
        Client: ChiralClient,
        
        // Initialize function
        init: initializeChiralClient,
        
        // Core modules (for advanced usage)
        Config: ChiralConfig,
        API: ChiralAPI,
        Display: ChiralDisplay,
        Cache: ChiralCache,
        I18n: ChiralI18n,
        Utils: ChiralUtils,
        
        // Version info
        version: '1.0.0'
    };

    // Also expose as a simple global for basic usage
    window.chiralClient = {
        init: initializeChiralClient,
        version: '1.0.0'
    };

    // Capture current script reference immediately during execution
    const currentExecutingScript = document.currentScript;
    ChiralUtils.log('Captured currentScript', 'info', currentExecutingScript);

    // Auto-initialization from global config or data attributes
    function performAutoInitialization() {
        ChiralUtils.log('performAutoInitialization called', 'info');
        
        // Method 1: Global config (existing)
        ChiralUtils.log('Checking for window.ChiralConfig', 'info', { 
            exists: typeof window.ChiralConfig !== 'undefined',
            value: window.ChiralConfig,
            isFunction: typeof window.ChiralConfig === 'function',
            isObject: typeof window.ChiralConfig === 'object'
        });
        
        // Check if window.ChiralConfig exists and is a config object (not the ChiralConfig class)
        if (typeof window.ChiralConfig !== 'undefined' && 
            typeof window.ChiralConfig === 'object' && 
            window.ChiralConfig !== null &&
            typeof window.ChiralConfig !== 'function') {
            try {
                ChiralUtils.log('Auto-initializing from window.ChiralConfig', 'info');
                initializeChiralClient(window.ChiralConfig);
            } catch (error) {
                ChiralUtils.log('Auto-initialization failed', 'error', error);
                // Don't show error in container here - let the display module handle it
            }
        } 
        // Method 2: Data attributes on script tag (new simple method)
        else {
            ChiralUtils.log('Checking for data attributes auto-init', 'info');
            let scriptToCheck = null;
            
            // First try to use the captured script reference
            ChiralUtils.log('Checking captured script', 'info', { 
                currentExecutingScript: currentExecutingScript,
                hasAutoInit: currentExecutingScript ? currentExecutingScript.getAttribute('data-auto-init') : null
            });
            
            if (currentExecutingScript && currentExecutingScript.getAttribute('data-auto-init') === 'true') {
                scriptToCheck = currentExecutingScript;
                ChiralUtils.log('Found captured script with auto-init', 'info');
            }
            
            // If no captured script, search all scripts (fallback for DOM ready)
            if (!scriptToCheck) {
                const scriptTags = document.querySelectorAll('script[data-auto-init="true"]');
                if (scriptTags.length > 0) {
                    scriptToCheck = scriptTags[0]; // Use the first one found
                    ChiralUtils.log('Found script via querySelector', 'info');
                }
            }
            
            if (scriptToCheck) {
                const hubUrl = scriptToCheck.getAttribute('data-hub-url');
                const container = scriptToCheck.getAttribute('data-container') || 'chiral-related-posts';
                const count = parseInt(scriptToCheck.getAttribute('data-count')) || 5;
                
                ChiralUtils.log('Script element found', 'info', scriptToCheck);
                ChiralUtils.log('Raw attributes', 'info', {
                    'data-hub-url': scriptToCheck.getAttribute('data-hub-url'),
                    'data-container': scriptToCheck.getAttribute('data-container'),
                    'data-count': scriptToCheck.getAttribute('data-count')
                });
                ChiralUtils.log('Processed values', 'info', { hubUrl, container, count });
                
                if (hubUrl) {
                    try {
                        ChiralUtils.log('Auto-initializing from data attributes', 'info', { hubUrl, container, count });
                        
                        const config = {
                            hubUrl: hubUrl,
                            containerId: container,
                            display: {
                                count: count,
                                enableCache: true,
                                cacheTTL: 3600,
                                showThumbnails: true,
                                showExcerpts: true
                            }
                        };
                        
                        ChiralUtils.log('Config object created', 'info', config);
                        
                        initializeChiralClient(config);
                        ChiralUtils.log('Auto-initialization completed successfully', 'info');
                    } catch (error) {
                        ChiralUtils.log('Data attribute initialization failed', 'error', error);
                        // Show configuration error only for actual config issues
                        const containerEl = document.getElementById(container);
                        if (containerEl && error.message.includes('required')) {
                            containerEl.innerHTML = '<p class="chiral-no-related-posts">Chiral Client configuration error. Please check your settings.</p>';
                        }
                    }
                } else {
                    ChiralUtils.log('Missing required data attribute: data-hub-url', 'warn');
                    // Only show error if container exists and user intended to use auto-init
                    const containerEl = document.getElementById(container);
                    if (containerEl && scriptToCheck.getAttribute('data-auto-init') === 'true') {
                        containerEl.innerHTML = '<p class="chiral-no-related-posts">Missing required configuration: data-hub-url is required.</p>';
                    }
                }
            } else {
                ChiralUtils.log('No global ChiralConfig or data-auto-init script found, skipping auto-initialization', 'warn');
            }
        }
    }

    // Execute auto-initialization immediately and also on DOM ready
    ChiralUtils.log('Executing auto-initialization immediately', 'info');
    performAutoInitialization();
    ChiralUtils.ready(() => {
        ChiralUtils.log('DOM ready, executing auto-initialization again', 'info');
        performAutoInitialization();
    });

    ChiralUtils.log('Chiral Static Client library loaded', 'info', {
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });

})(window); 