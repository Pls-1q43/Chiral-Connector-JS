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