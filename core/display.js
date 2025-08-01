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
        this.api = new ChiralAPI(this.config.get('hubUrl'), this.config.get('nodeId'));
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