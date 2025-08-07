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