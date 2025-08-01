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