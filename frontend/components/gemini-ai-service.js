/**
 * Gemini AI Service
 * Service để kết nối và giao tiếp với Gemini 2.0 API
 */

class GeminiAIService {
    constructor() {
        this.apiKey = GEMINI_CONFIG.API_KEY;
        this.baseUrl = GEMINI_CONFIG.BASE_URL;
        this.conversationHistory = [];
        this.isProcessing = false;
        this.retryCount = 0;
        this.debugMode = true; // Enable debug logging

        // Kiểm tra API key
        console.log('🔑 Checking API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not found');

        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY' || this.apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY') {
            console.warn('⚠️ Gemini API key chưa được cấu hình đúng. Sử dụng mock responses.');
            this.useMockResponses = true;
        } else {
            console.log('✅ Gemini API key found, will attempt real API calls');
            this.useMockResponses = false;
        }

        console.log('🤖 GeminiAIService initialized:', {
            useMockResponses: this.useMockResponses,
            baseUrl: this.baseUrl,
            debugMode: this.debugMode
        });
    }

    /**
     * Gửi tin nhắn đến Gemini AI
     * @param {string} message - Tin nhắn từ người dùng
     * @param {string} pageContext - Ngữ cảnh trang hiện tại
     * @returns {Promise<string>} - Phản hồi từ AI
     */
    async sendMessage(message, pageContext = '') {
        if (this.isProcessing) {
            throw new Error('Đang xử lý tin nhắn khác, vui lòng đợi...');
        }

        this.isProcessing = true;

        try {
            // Nếu không có API key, sử dụng mock response
            if (this.useMockResponses) {
                return await this.getMockResponse(message, pageContext);
            }

            // Tạo system prompt
            const systemPrompt = getSystemPrompt();
            
            // Tạo context từ lịch sử hội thoại
            const contextMessages = this.buildContextMessages(systemPrompt, message, pageContext);

            // Gửi request đến Gemini API
            const response = await this.callGeminiAPI(contextMessages);
            
            // Lưu vào lịch sử
            this.addToHistory('user', message);
            this.addToHistory('assistant', response);
            
            this.retryCount = 0; // Reset retry count on success
            return response;

        } catch (error) {
            console.error('❌ Gemini AI Error:', error.message);

            // Retry logic for network errors
            if (this.retryCount < GEMINI_CONFIG.MAX_RETRIES &&
                (error.message.includes('timeout') || error.message.includes('network') || error.message.includes('fetch'))) {
                this.retryCount++;
                console.log(`🔄 Retry attempt ${this.retryCount}/${GEMINI_CONFIG.MAX_RETRIES}`);

                await this.delay(GEMINI_CONFIG.RETRY_DELAY * this.retryCount);
                return await this.sendMessage(message, pageContext);
            }

            // Fallback to mock response on error
            console.log('🎭 Falling back to mock response due to API error:', error.message);
            const mockResponse = await this.getMockResponse(message, pageContext);

            // Still save to history for context
            this.addToHistory('user', message);
            this.addToHistory('assistant', mockResponse);

            this.retryCount = 0; // Reset retry count
            return mockResponse;

        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Gọi Gemini API
     * @param {Array} messages - Danh sách tin nhắn
     * @returns {Promise<string>} - Phản hồi từ API
     */
    async callGeminiAPI(messages) {
        const requestBody = {
            contents: messages,
            generationConfig: {
                temperature: GEMINI_CONFIG.TEMPERATURE,
                topK: GEMINI_CONFIG.TOP_K,
                topP: GEMINI_CONFIG.TOP_P,
                maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);

        try {
            console.log('🔄 Calling Gemini API...', {
                url: `${this.baseUrl}?key=${this.apiKey.substring(0, 10)}...`,
                messagesCount: requestBody.contents.length
            });

            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('📡 API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { error: { message: errorText } };
                }

                throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            console.log('✅ API Response received:', {
                candidates: data.candidates?.length || 0,
                hasContent: !!data.candidates?.[0]?.content
            });

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('❌ Invalid API response structure:', data);
                throw new Error('Invalid response format from Gemini API');
            }

            const responseText = data.candidates[0].content.parts[0].text;
            console.log('💬 AI Response:', responseText.substring(0, 100) + '...');

            return responseText;

        } catch (error) {
            clearTimeout(timeoutId);

            console.error('❌ Gemini API Error:', error);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout - API took too long to respond');
            }

            throw error;
        }
    }

    /**
     * Xây dựng context messages cho API
     * @param {string} systemPrompt - System prompt
     * @param {string} userMessage - Tin nhắn người dùng
     * @param {string} pageContext - Ngữ cảnh trang
     * @returns {Array} - Danh sách messages
     */
    buildContextMessages(systemPrompt, userMessage, pageContext) {
        const messages = [];

        // Nếu không có lịch sử, bắt đầu với system prompt
        if (this.conversationHistory.length === 0) {
            messages.push({
                role: "user",
                parts: [{ text: systemPrompt }]
            });

            messages.push({
                role: "model",
                parts: [{ text: "Tôi hiểu. Tôi sẽ trả lời theo vai trò được giao và cung cấp thông tin hữu ích về du lịch Trà Vinh." }]
            });
        }

        // Add conversation history (last 8 exchanges)
        const recentHistory = this.conversationHistory.slice(-8);
        recentHistory.forEach(item => {
            messages.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: item.content }]
            });
        });

        // Current user message
        const finalMessage = pageContext
            ? `${userMessage} (Ngữ cảnh: ${pageContext})`
            : userMessage;

        messages.push({
            role: "user",
            parts: [{ text: finalMessage }]
        });

        return messages;
    }

    /**
     * Mock responses khi không có API key hoặc API lỗi
     * @param {string} message - Tin nhắn người dùng
     * @param {string} pageContext - Ngữ cảnh trang
     * @returns {Promise<string>} - Mock response
     */
    async getMockResponse(message, pageContext) {
        console.log('🎭 Using mock response for:', message);

        // Simulate API delay
        await this.delay(800 + Math.random() * 1200);

        const pageType = getCurrentPageType();
        const lowerMessage = message.toLowerCase();

        // Enhanced mock responses
        const mockResponses = {
            'index': {
                'giới thiệu': '🏛️ **Trà Vinh - Vùng đất văn hóa Khmer**\n\nTrà Vinh là tỉnh ven biển thuộc đồng bằng sông Cửu Long, nổi tiếng với:\n\n• **Văn hóa đa dạng:** Kinh - Khmer - Hoa\n• **Kiến trúc độc đáo:** Hơn 140 ngôi chùa Khmer\n• **Thiên nhiên tươi đẹp:** Cù lao, rừng tràm\n• **Ẩm thực phong phú:** Đặc sản miền Tây Nam Bộ',
                'địa điểm': '🗺️ **Địa điểm du lịch nổi tiếng:**\n\n• **Chùa Ang:** Kiến trúc Khmer cổ kính\n• **Ao Bà Om:** Hồ cổ thụ linh thiêng\n• **Chùa Hang:** Nằm trong hang động tự nhiên\n• **Bảo tàng Khmer:** Trưng bày văn hóa dân tộc\n• **Cù lao Tân Quy:** Sinh thái sông nước',
                'ẩm thực': '🍜 **Ẩm thực đặc sản Trà Vinh:**\n\n• **Bánh tét lá cẩm:** Đặc sản nổi tiếng nhất\n• **Cháo cá linh bông điên điển:** Món ăn dân dã\n• **Bánh xèo miền Tây:** Giòn rụm thơm ngon\n• **Cà ri gà Khmer:** Đậm đà hương vị\n• **Bánh ít lá gai:** Bánh truyền thống',
                'kế hoạch': '📋 **Lập kế hoạch du lịch Trà Vinh:**\n\n**Thời gian lý tưởng:** Tháng 11 - 4 (mùa khô)\n\n**Gợi ý lịch trình:**\n• **1 ngày:** Trung tâm thành phố + chùa Khmer\n• **2-3 ngày:** Thêm cù lao + sinh thái\n• **4-5 ngày:** Khám phá toàn diện',
                'default': '🤖 **Xin chào! Tôi là AI trợ lý du lịch Trà Vinh.**\n\nTôi có thể giúp bạn:\n• 🏛️ Tìm hiểu về Trà Vinh\n• 🗺️ Khám phá địa điểm du lịch\n• 🍜 Khám phá ẩm thực đặc sản\n• 📋 Lập kế hoạch lịch trình\n\nBạn muốn biết điều gì về Trà Vinh?'
            },
            'dia-diem': {
                'chùa': '🏛️ **Chùa Khmer nổi tiếng:**\n\n• **Chùa Ang (Angkorajaborey):** Lâu đời nhất\n• **Chùa Hang (Kompong Chrây):** Trong hang động\n• **Chùa Cò (Wat Koh):** Có đàn cò trắng\n• **Chùa Dơi (Wat Preah Bat):** Kiến trúc độc đáo',
                'ao bà om': '🌊 **Ao Bà Om** là hồ cổ thụ linh thiêng với cây đa cổ thụ hàng trăm năm tuổi, nơi tổ chức lễ hội Ok Om Bok của người Khmer.',
                'lịch trình': '📍 **Gợi ý lịch trình tham quan:**\n\n**Sáng:** Chùa Ang → Bảo tàng Khmer\n**Chiều:** Ao Bà Om → Chùa Hang\n**Tối:** Chợ đêm Trà Vinh',
                'default': '🗺️ **Chào bạn!** Tôi có thể giúp bạn tìm kiếm địa điểm du lịch, gợi ý lịch trình và cung cấp thông tin chi tiết về các điểm tham quan ở Trà Vinh.'
            }
        };

        const pageResponses = mockResponses[pageType] || mockResponses['index'];

        // Find matching response
        for (const [key, response] of Object.entries(pageResponses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                console.log('✅ Found matching mock response for:', key);
                return response;
            }
        }

        console.log('📝 Using default mock response');
        return pageResponses.default;
    }

    /**
     * Thêm tin nhắn vào lịch sử
     * @param {string} role - Role (user/assistant)
     * @param {string} content - Nội dung tin nhắn
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date()
        });

        // Giới hạn lịch sử (giữ 20 tin nhắn gần nhất)
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    /**
     * Xóa lịch sử hội thoại
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Delay utility
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Kiểm tra trạng thái API
     * @returns {boolean} - True nếu API sẵn sàng
     */
    isReady() {
        return !this.useMockResponses && !this.isProcessing;
    }

    /**
     * Get conversation history
     * @returns {Array} - Lịch sử hội thoại
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Test API connection
     * @returns {Promise<boolean>} - True nếu API hoạt động
     */
    async testAPIConnection() {
        if (this.useMockResponses) {
            console.log('🎭 API test skipped - using mock responses');
            return false;
        }

        try {
            console.log('🧪 Testing Gemini API connection...');

            const testMessage = [{
                role: "user",
                parts: [{ text: "Hello, please respond with just 'OK' to test the connection." }]
            }];

            const response = await this.callGeminiAPI(testMessage);
            console.log('✅ API test successful:', response);
            return true;

        } catch (error) {
            console.error('❌ API test failed:', error.message);
            return false;
        }
    }
}

// Export service
window.GeminiAIService = GeminiAIService;
