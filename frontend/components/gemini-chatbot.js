/**
 * Gemini Chatbot JavaScript
 * Handles UI interactions and API calls to Gemini 2.0 Flash
 */

class GeminiChatbot {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        this.messages = [];
        this.isTyping = false;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.init();
    }

    /**
     * Initialize chatbot
     */
    init() {
        this.setupEventListeners();
        this.checkApiKey();
        this.loadChatHistory();
        
        console.log('🤖 Gemini Chatbot initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');

        // Auto-resize textarea
        messageInput.addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
            this.updateCharCount();
        });

        // Handle Enter key
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button click
        sendButton.addEventListener('click', () => this.sendMessage());

        // API key modal events
        document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }

    /**
     * Auto-resize textarea based on content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Update character count
     */
    updateCharCount() {
        const messageInput = document.getElementById('messageInput');
        const charCount = document.getElementById('charCount');
        const currentLength = messageInput.value.length;
        
        charCount.textContent = `${currentLength}/1000`;
        charCount.className = currentLength > 900 ? 'text-red-500' : 'text-gray-500';
    }

    /**
     * Load API key from localStorage
     */
    loadApiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    }

    /**
     * Save API key to localStorage
     */
    saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            alert('Vui lòng nhập API key');
            return;
        }

        if (!apiKey.startsWith('AIzaSy') || apiKey.length < 35) {
            alert('API key không hợp lệ. API key Gemini phải bắt đầu bằng "AIzaSy" và dài ít nhất 35 ký tự.');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);
        
        this.closeApiKeyModal();
        this.updateConnectionStatus(true);
        
        console.log('✅ API key saved successfully');
    }

    /**
     * Check if API key is configured
     */
    checkApiKey() {
        if (!this.apiKey || this.apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY') {
            this.showApiKeyModal();
            this.updateConnectionStatus(false);
        } else {
            this.updateConnectionStatus(true);
        }
    }

    /**
     * Show API key modal
     */
    showApiKeyModal() {
        document.getElementById('apiKeyModal').classList.remove('hidden');
        document.getElementById('apiKeyInput').focus();
    }

    /**
     * Close API key modal
     */
    closeApiKeyModal() {
        document.getElementById('apiKeyModal').classList.add('hidden');
        document.getElementById('apiKeyInput').value = '';
    }

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        const statusDot = statusElement.querySelector('div');
        const statusText = statusElement.querySelector('span');

        if (isConnected) {
            statusDot.className = 'w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse';
            statusText.textContent = 'Online';
        } else {
            statusDot.className = 'w-3 h-3 bg-red-400 rounded-full mr-2';
            statusText.textContent = 'Offline';
        }
    }

    /**
     * Send message to Gemini API with caching
     */
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || this.isTyping) {
            return;
        }

        if (!this.apiKey) {
            this.showApiKeyModal();
            return;
        }

        // Clear input and add user message
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.updateCharCount();

        this.addMessage('user', message);
        this.showTypingIndicator();

        try {
            let response;

            // Check cache first for instant response
            if (window.responseCache && window.responseCache.has(message)) {
                response = window.responseCache.get(message);
                console.log('⚡ Using cached response');

                // Simulate short delay for better UX
                await this.delay(300);
            } else if (window.responseCache) {
                // Check for similar responses
                response = window.responseCache.findSimilar(message);
                if (response) {
                    console.log('🎯 Using similar cached response');
                    await this.delay(500);
                }
            }

            // If no cache hit, call API
            if (!response) {
                response = await this.callGeminiAPI(message);

                // Cache the response
                if (window.responseCache) {
                    window.responseCache.set(message, response);
                }
            }

            this.hideTypingIndicator();
            this.addMessage('assistant', response);
            this.saveChatHistory();
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', `Lỗi: ${error.message}`);
            console.error('Chat error:', error);
        }
    }

    /**
     * Send quick message
     */
    sendQuickMessage(message) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = message;
        this.sendMessage();
    }

    /**
     * Call Gemini API with curl-style implementation
     */
    async callGeminiAPI(message, retryCount = 0) {
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: this.buildContextualMessage(message)
                        }
                    ]
                }
            ]
        };

        const headers = {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
        };

        console.log('📤 Calling Gemini API:', {
            url: this.apiUrl,
            method: 'POST',
            headers: {
                'Content-Type': headers['Content-Type'],
                'X-goog-api-key': `${this.apiKey.substring(0, 10)}...`
            }
        });

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'API request failed'}`);
            }

            const data = await response.json();

            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response format from Gemini API');
            }

            const responseText = data.candidates[0].content.parts[0].text;
            console.log('📥 Received response from Gemini API');

            return responseText;

        } catch (error) {
            console.error('❌ Gemini API Error:', error);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout - API took too long to respond');
            }

            // Retry logic
            if (retryCount < this.maxRetries && !error.message.includes('HTTP 4')) {
                console.log(`🔄 Retrying API call (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.callGeminiAPI(message, retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Build contextual message with optimized system prompt
     */
    buildContextualMessage(userMessage) {
        const systemPrompt = `Bạn là chuyên gia du lịch Trà Vinh với 10 năm kinh nghiệm. Trả lời NGẮN GỌN (tối đa 150 từ), CHÍNH XÁC và THỰC TẾ.

🎯 LUÔN CUNG CẤP:
- Giá cả cụ thể (VNĐ)
- Khoảng cách và thời gian di chuyển
- Giờ mở cửa
- Số điện thoại liên hệ (nếu có)

🏛️ ĐỊA ĐIỂM CHÍNH:
- Chùa Ang: 5km từ TT, miễn phí, 5h-18h
- Ao Bà Om: 7km, vé 10k, thuê thúng chai 50k
- Chùa Hang: 8km, trong hang tự nhiên
- Cù lao Tân Quy: 15km, tour 200k/người

🍜 ẨM THỰC & GIÁ:
- Bánh tét lá cẩm: 15k/cái
- Cháo cá linh: 25k/tô
- Bánh xèo: 20k/cái
- Cà ri gà Khmer: 45k/phần

🚗 DI CHUYỂN:
- Từ TP.HCM: 200km, 4h, xe khách 80-120k
- Trong thành phố: xe ôm 15-30k, taxi 50-100k

${this.getRecentContext()}

Câu hỏi: ${userMessage}

Trả lời NGẮN, CHÍNH XÁC với số liệu cụ thể.`;

        return systemPrompt;
    }

    /**
     * Get recent conversation context
     */
    getRecentContext() {
        if (this.messages.length === 0) return '';

        const recentMessages = this.messages.slice(-4); // Last 4 messages
        let context = 'Ngữ cảnh cuộc trò chuyện gần đây:\n';

        recentMessages.forEach(msg => {
            if (msg.type === 'user') {
                context += `Người dùng: ${msg.content}\n`;
            } else if (msg.type === 'assistant') {
                context += `AI: ${msg.content.substring(0, 100)}...\n`;
            }
        });

        return context;
    }

    /**
     * Add message to chat
     */
    addMessage(type, content) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(type, content);
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Add to messages array
        this.messages.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Create message element
     */
    createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start space-x-3 message-animation';

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="flex-1"></div>
                <div class="chat-bubble-user max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-tr-sm text-white">
                    <p class="text-sm whitespace-pre-wrap">${this.escapeHtml(content)}</p>
                </div>
                <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
            `;
        } else if (type === 'assistant') {
            messageDiv.innerHTML = `
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="chat-bubble-ai max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-tl-sm">
                    <p class="text-sm whitespace-pre-wrap">${this.formatResponse(content)}</p>
                </div>
            `;
        } else if (type === 'error') {
            messageDiv.innerHTML = `
                <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-white text-sm"></i>
                </div>
                <div class="bg-red-50 border border-red-200 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-tl-sm">
                    <p class="text-sm text-red-700">${this.escapeHtml(content)}</p>
                </div>
            `;
        }

        return messageDiv;
    }

    /**
     * Format AI response with basic markdown support
     */
    formatResponse(content) {
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.isTyping = true;
        document.getElementById('typingIndicator').classList.remove('hidden');
        document.getElementById('sendButton').disabled = true;
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        document.getElementById('typingIndicator').classList.add('hidden');
        document.getElementById('sendButton').disabled = false;
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    /**
     * Clear chat history
     */
    clearChat() {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện?')) {
            const messagesContainer = document.getElementById('messagesContainer');

            // Keep only welcome message
            const welcomeMessage = messagesContainer.firstElementChild;
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(welcomeMessage);

            this.messages = [];
            this.saveChatHistory();

            console.log('🗑️ Chat cleared');
        }
    }

    /**
     * Export chat history
     */
    exportChat() {
        if (this.messages.length === 0) {
            alert('Không có cuộc trò chuyện nào để xuất');
            return;
        }

        const chatData = {
            title: 'Cuộc trò chuyện với Gemini AI - Du lịch Trà Vinh',
            timestamp: new Date().toLocaleString('vi-VN'),
            messages: this.messages.map(msg => ({
                type: msg.type === 'user' ? 'Người dùng' : 'AI Assistant',
                content: msg.content,
                time: new Date(msg.timestamp).toLocaleString('vi-VN')
            }))
        };

        // Create text format
        let textContent = `${chatData.title}\n`;
        textContent += `Thời gian xuất: ${chatData.timestamp}\n`;
        textContent += '='.repeat(50) + '\n\n';

        chatData.messages.forEach(msg => {
            textContent += `[${msg.time}] ${msg.type}:\n`;
            textContent += `${msg.content}\n\n`;
        });

        // Download as text file
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gemini-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📥 Chat exported successfully');
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            localStorage.setItem('gemini_chat_history', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const history = localStorage.getItem('gemini_chat_history');
            if (history) {
                this.messages = JSON.parse(history);
                
                // Restore messages (skip welcome message)
                this.messages.forEach(msg => {
                    if (msg.type !== 'welcome') {
                        this.addMessageToUI(msg.type, msg.content);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    /**
     * Add message to UI only (without adding to messages array)
     */
    addMessageToUI(type, content) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(type, content);
        messagesContainer.appendChild(messageElement);
    }

    /**
     * Delay utility function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for HTML onclick events
function sendMessage() {
    window.chatbot.sendMessage();
}

function sendQuickMessage(message) {
    window.chatbot.sendQuickMessage(message);
}

function clearChat() {
    window.chatbot.clearChat();
}

function exportChat() {
    window.chatbot.exportChat();
}

function saveApiKey() {
    window.chatbot.saveApiKey();
}

function closeApiKeyModal() {
    window.chatbot.closeApiKeyModal();
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.chatbot = new GeminiChatbot();
    console.log('🚀 Gemini Chatbot ready!');
});
