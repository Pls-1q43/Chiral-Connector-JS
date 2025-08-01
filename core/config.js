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