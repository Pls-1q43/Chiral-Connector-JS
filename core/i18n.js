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