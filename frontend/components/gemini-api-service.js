/**
 * Gemini API Service - Curl-style Implementation
 * Triển khai API service theo đúng format curl command
 */

class GeminiApiService {
    constructor() {
        this.isInitialized = false;
        this.config = null;
        this.init();
    }

    /**
     * Initialize service
     */
    init() {
        // Đợi config được load
        if (typeof window.GEMINI_CONFIG !== 'undefined') {
            this.config = window.GEMINI_CONFIG;
            this.isInitialized = true;
            console.log('🚀 Gemini API Service initialized');
        } else {
            console.warn('⚠️ GEMINI_CONFIG not found, retrying...');
            setTimeout(() => this.init(), 100);
        }
    }

    /**
     * Gửi request đến Gemini API theo format curl
     * @param {string} text - Nội dung tin nhắn
     * @returns {Promise<string>} - Phản hồi từ API
     */
    async generateContent(text) {
        if (!this.isInitialized) {
            throw new Error('Service chưa được khởi tạo');
        }

        const apiKey = this.config.API_KEY;
        if (!apiKey || apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY') {
            throw new Error('API key chưa được cấu hình. Vui lòng cập nhật API key.');
        }

        // Tạo request body theo format curl
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: text
                        }
                    ]
                }
            ]
        };

        // Tạo headers theo format curl
        const headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
        };

        console.log('📤 Sending request to Gemini API:', {
            url: this.config.BASE_URL,
            method: 'POST',
            headers: {
                'Content-Type': headers['Content-Type'],
                'X-goog-api-key': `${apiKey.substring(0, 10)}...`
            },
            bodyPreview: text.substring(0, 100) + '...'
        });

        try {
            // Gửi request với timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.TIMEOUT);

            const response = await fetch(this.config.BASE_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Kiểm tra response status
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'API request failed'}`);
            }

            // Parse response
            const data = await response.json();
            
            // Validate response structure
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('❌ Invalid API response:', data);
                throw new Error('Invalid response format from Gemini API');
            }

            const responseText = data.candidates[0].content.parts[0].text;
            
            console.log('📥 Received response from Gemini API:', {
                length: responseText.length,
                preview: responseText.substring(0, 100) + '...'
            });

            return responseText;

        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - API took too long to respond');
            }
            
            throw error;
        }
    }

    /**
     * Test API connection
     * @returns {Promise<boolean>} - True nếu API hoạt động
     */
    async testConnection() {
        try {
            console.log('🧪 Testing Gemini API connection...');
            
            const response = await this.generateContent('Hello, please respond with just "OK" to test the connection.');
            
            console.log('✅ API test successful:', response);
            return true;
            
        } catch (error) {
            console.error('❌ API test failed:', error.message);
            return false;
        }
    }

    /**
     * Cập nhật API key
     * @param {string} newApiKey - API key mới
     * @returns {boolean} - True nếu cập nhật thành công
     */
    updateApiKey(newApiKey) {
        if (typeof window.updateGeminiApiKey === 'function') {
            const success = window.updateGeminiApiKey(newApiKey);
            if (success) {
                this.config = window.GEMINI_CONFIG;
                console.log('🔑 API key updated in service');
                return true;
            }
        }
        return false;
    }

    /**
     * Kiểm tra API key có hợp lệ không
     * @returns {boolean} - True nếu API key hợp lệ
     */
    isApiKeyValid() {
        if (typeof window.isGeminiApiKeyValid === 'function') {
            return window.isGeminiApiKeyValid();
        }
        
        const apiKey = this.config?.API_KEY;
        return apiKey && 
               apiKey !== 'YOUR_ACTUAL_GEMINI_API_KEY' && 
               apiKey.startsWith('AIzaSy') && 
               apiKey.length >= 35;
    }

    /**
     * Get current configuration
     * @returns {object} - Current config
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Reload configuration
     */
    reloadConfig() {
        if (typeof window.reloadGeminiConfig === 'function') {
            window.reloadGeminiConfig();
            this.config = window.GEMINI_CONFIG;
            console.log('🔄 Service config reloaded');
        }
    }
}

// Create global instance
window.geminiApiService = new GeminiApiService();

// Export class
window.GeminiApiService = GeminiApiService;

console.log('🔧 Gemini API Service loaded');
