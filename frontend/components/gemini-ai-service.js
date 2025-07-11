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
        
        // Kiểm tra API key
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY') {
            console.warn('⚠️ Gemini API key chưa được cấu hình. Sử dụng mock responses.');
            this.useMockResponses = true;
        } else {
            this.useMockResponses = false;
        }
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
            console.error('Gemini AI Error:', error);
            
            // Retry logic
            if (this.retryCount < GEMINI_CONFIG.MAX_RETRIES) {
                this.retryCount++;
                console.log(`Retry attempt ${this.retryCount}/${GEMINI_CONFIG.MAX_RETRIES}`);
                
                await this.delay(GEMINI_CONFIG.RETRY_DELAY * this.retryCount);
                return await this.sendMessage(message, pageContext);
            }
            
            // Fallback to mock response on error
            console.log('Falling back to mock response due to API error');
            return await this.getMockResponse(message, pageContext);
            
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
                }
            ]
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT);

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            return data.candidates[0].content.parts[0].text;

        } catch (error) {
            clearTimeout(timeoutId);
            
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

        // System message (as user message với prefix)
        messages.push({
            role: "user",
            parts: [{ text: `[SYSTEM] ${systemPrompt}` }]
        });

        // Add conversation history (last 5 exchanges)
        const recentHistory = this.conversationHistory.slice(-10);
        recentHistory.forEach(item => {
            messages.push({
                role: item.role === 'user' ? 'user' : 'model',
                parts: [{ text: item.content }]
            });
        });

        // Current user message with page context
        const contextualMessage = pageContext 
            ? `[CONTEXT: ${pageContext}] ${userMessage}`
            : userMessage;

        messages.push({
            role: "user",
            parts: [{ text: contextualMessage }]
        });

        return messages;
    }

    /**
     * Mock responses khi không có API key
     * @param {string} message - Tin nhắn người dùng
     * @param {string} pageContext - Ngữ cảnh trang
     * @returns {Promise<string>} - Mock response
     */
    async getMockResponse(message, pageContext) {
        // Simulate API delay
        await this.delay(1000 + Math.random() * 2000);

        const pageType = getCurrentPageType();
        const lowerMessage = message.toLowerCase();

        // Mock responses based on page and message content
        const mockResponses = {
            'index': {
                'giới thiệu': '🏛️ **Trà Vinh** là tỉnh ven biển thuộc đồng bằng sông Cửu Long, nổi tiếng với văn hóa Khmer đặc sắc và hơn 140 ngôi chùa cổ kính.',
                'địa điểm': '🗺️ **Địa điểm nổi bật:** Chùa Ang, Ao Bà Om, Chùa Hang, Bảo tàng Khmer, Cù lao Tân Quy...',
                'ẩm thực': '🍜 **Đặc sản:** Bánh tét lá cẩm, cháo cá linh bông điên điển, bánh xèo miền Tây, cà ri gà Khmer...',
                'default': '🤖 Xin chào! Tôi là AI trợ lý du lịch Trà Vinh. Tôi có thể giúp bạn tìm hiểu về địa điểm, ẩm thực và lập kế hoạch du lịch.'
            },
            'dia-diem': {
                'chùa': '🏛️ **Chùa Khmer nổi tiếng:** Chùa Ang (lâu đời nhất), Chùa Hang (trong hang động), Chùa Cò (có đàn cò trắng)...',
                'ao bà om': '🌊 **Ao Bà Om** là hồ cổ thụ linh thiêng với cây đa cổ thụ hàng trăm năm tuổi, nơi tổ chức lễ hội Ok Om Bok.',
                'default': '🗺️ Tôi có thể giúp bạn tìm kiếm địa điểm du lịch, gợi ý lịch trình và cung cấp thông tin chi tiết về các điểm tham quan.'
            }
        };

        const pageResponses = mockResponses[pageType] || mockResponses['index'];
        
        // Find matching response
        for (const [key, response] of Object.entries(pageResponses)) {
            if (key !== 'default' && lowerMessage.includes(key)) {
                return response;
            }
        }

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
}

// Export service
window.GeminiAIService = GeminiAIService;
