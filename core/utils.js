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