/**
 * Environment Variables Loader for Frontend
 * Load configuration từ .env file hoặc từ config object
 */

class EnvLoader {
    constructor() {
        this.config = {};
        this.loadConfig();
    }

    /**
     * Load configuration từ nhiều nguồn
     */
    loadConfig() {
        // Thử load từ .env file (nếu có server hỗ trợ)
        this.loadFromEnvFile();
        
        // Load từ config object (fallback)
        this.loadFromConfigObject();
        
        // Load từ localStorage (user settings)
        this.loadFromLocalStorage();
        
        console.log('🔧 Environment loaded:', {
            hasApiKey: !!this.get('GEMINI_API_KEY'),
            baseUrl: this.get('GEMINI_BASE_URL'),
            debugMode: this.get('DEBUG_MODE')
        });
    }

    /**
     * Load từ .env file (chỉ hoạt động với server)
     */
    async loadFromEnvFile() {
        try {
            // Trong môi trường frontend thuần, không thể đọc .env trực tiếp
            // Cần server hoặc build tool hỗ trợ
            console.log('📁 .env file loading skipped (frontend only)');
        } catch (error) {
            console.log('📁 .env file not available:', error.message);
        }
    }

    /**
     * Load từ config object (default values)
     */
    loadFromConfigObject() {
        const defaultConfig = {
            GEMINI_API_KEY: 'YOUR_ACTUAL_GEMINI_API_KEY',
            GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            GEMINI_MODEL: 'gemini-2.0-flash',
            GEMINI_MAX_TOKENS: '1000',
            GEMINI_TEMPERATURE: '0.7',
            GEMINI_TOP_P: '0.8',
            GEMINI_TOP_K: '40',
            GEMINI_TIMEOUT: '30000',
            GEMINI_MAX_RETRIES: '3',
            GEMINI_RETRY_DELAY: '1000',
            DEBUG_MODE: 'true'
        };

        Object.assign(this.config, defaultConfig);
    }

    /**
     * Load từ localStorage (user settings)
     */
    loadFromLocalStorage() {
        try {
            const savedConfig = localStorage.getItem('gemini_config');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                Object.assign(this.config, parsed);
                console.log('💾 Config loaded from localStorage');
            }
        } catch (error) {
            console.log('💾 localStorage config not available:', error.message);
        }
    }

    /**
     * Get environment variable
     * @param {string} key - Variable name
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Variable value
     */
    get(key, defaultValue = null) {
        return this.config[key] || defaultValue;
    }

    /**
     * Set environment variable
     * @param {string} key - Variable name
     * @param {*} value - Variable value
     * @param {boolean} persist - Save to localStorage
     */
    set(key, value, persist = false) {
        this.config[key] = value;
        
        if (persist) {
            this.saveToLocalStorage();
        }
        
        console.log(`🔧 Config updated: ${key} = ${value}`);
    }

    /**
     * Save config to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('gemini_config', JSON.stringify(this.config));
            console.log('💾 Config saved to localStorage');
        } catch (error) {
            console.error('💾 Failed to save config:', error);
        }
    }

    /**
     * Update API key
     * @param {string} apiKey - New API key
     */
    updateApiKey(apiKey) {
        if (!apiKey || apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY') {
            console.warn('⚠️ Invalid API key provided');
            return false;
        }

        this.set('GEMINI_API_KEY', apiKey, true);
        console.log('🔑 API key updated successfully');
        return true;
    }

    /**
     * Check if API key is valid
     * @returns {boolean} True if API key looks valid
     */
    isApiKeyValid() {
        const apiKey = this.get('GEMINI_API_KEY');
        return apiKey && 
               apiKey !== 'YOUR_ACTUAL_GEMINI_API_KEY' && 
               apiKey.startsWith('AIzaSy') && 
               apiKey.length >= 35;
    }

    /**
     * Get all config as object
     * @returns {object} Configuration object
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Reset to default configuration
     */
    reset() {
        localStorage.removeItem('gemini_config');
        this.config = {};
        this.loadConfig();
        console.log('🔄 Configuration reset to defaults');
    }
}

// Create global instance
window.envLoader = new EnvLoader();

// Export for modules
window.EnvLoader = EnvLoader;

console.log('🌍 Environment loader initialized');
