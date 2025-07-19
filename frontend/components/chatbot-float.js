/**
 * Floating Chatbot Component
 * Component chatbot nổi để sử dụng trên tất cả các trang
 */

class FloatingChatbot {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
            size: 'medium', // small, medium, large
            theme: 'blue', // blue, green, purple, red
            tooltip: 'Chat với AI Gemini',
            chatbotUrl: 'gemini-chatbot.html',
            windowFeatures: 'width=1200,height=800,scrollbars=yes,resizable=yes',
            inlineMode: true, // Use inline window instead of popup
            ...options
        };

        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.apiKey = this.loadApiKey();

        this.init();
    }

    /**
     * Initialize floating chatbot
     */
    init() {
        this.createStyles();
        this.createHTML();
        this.bindEvents();
        
        console.log('🤖 Floating Chatbot initialized');
    }

    /**
     * Create CSS styles
     */
    createStyles() {
        if (document.getElementById('floating-chatbot-styles')) {
            return; // Styles already exist
        }

        const style = document.createElement('style');
        style.id = 'floating-chatbot-styles';
        style.textContent = `
            .floating-chatbot {
                position: fixed;
                z-index: 1000;
                ${this.getPositionStyles()}
            }

            .floating-chatbot-button {
                ${this.getSizeStyles()}
                border-radius: 50%;
                ${this.getThemeStyles()}
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }

            .floating-chatbot-button:hover {
                transform: scale(1.1);
                ${this.getHoverStyles()}
            }

            .floating-chatbot-button:active {
                transform: scale(0.95);
            }

            .floating-chatbot-tooltip {
                position: absolute;
                ${this.getTooltipPosition()}
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                white-space: nowrap;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
                pointer-events: none;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .floating-chatbot-button:hover .floating-chatbot-tooltip {
                opacity: 1;
                transform: translateY(0);
            }

            .floating-chatbot-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                ${this.getThemeStyles()}
                opacity: 0.6;
                animation: chatbot-pulse 2s infinite;
            }

            /* Inline Chatbot Window */
            .floating-chatbot-window {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 380px;
                height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                transform: translateY(20px) scale(0.95);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }

            .floating-chatbot-window.active {
                transform: translateY(0) scale(1);
                opacity: 1;
                visibility: visible;
            }

            .floating-chatbot-header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-radius: 16px 16px 0 0;
            }

            .floating-chatbot-header h3 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
            }

            .floating-chatbot-header p {
                font-size: 12px;
                opacity: 0.9;
                margin: 2px 0 0 0;
            }

            .floating-chatbot-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            .floating-chatbot-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .floating-chatbot-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                background: #f8fafc;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .floating-chatbot-input-area {
                padding: 16px;
                border-top: 1px solid #e5e7eb;
                background: white;
                border-radius: 0 0 16px 16px;
            }

            .floating-chatbot-input {
                width: 100%;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 10px 50px 10px 12px;
                outline: none;
                transition: all 0.3s ease;
                font-size: 14px;
                resize: none;
                font-family: inherit;
            }

            .floating-chatbot-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .floating-chatbot-send {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background-color 0.2s;
                font-size: 14px;
                z-index: 10;
            }

            .floating-chatbot-send:hover {
                background: #2563eb;
            }

            .floating-chatbot-send:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            .floating-message {
                display: flex;
                align-items: flex-end;
                gap: 8px;
                max-width: 100%;
            }

            .floating-message.user {
                justify-content: flex-end;
            }

            .floating-message.ai {
                justify-content: flex-start;
            }

            .floating-message-bubble {
                max-width: 280px;
                padding: 10px 14px;
                border-radius: 16px;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
            }

            .floating-message-bubble.user {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .floating-message-bubble.ai {
                background: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-bottom-left-radius: 4px;
            }

            .floating-typing-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 10px 14px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                border-bottom-left-radius: 4px;
                max-width: fit-content;
            }

            .floating-typing-dot {
                width: 6px;
                height: 6px;
                background: #9ca3af;
                border-radius: 50%;
                animation: floating-typing 1.4s infinite;
            }

            .floating-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .floating-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes chatbot-pulse {
                0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                }
                70% {
                    transform: translate(-50%, -50%) scale(1.4);
                    opacity: 0;
                }
                100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0;
                }
            }

            @keyframes floating-typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                }
                30% {
                    transform: translateY(-8px);
                }
            }

            .floating-chatbot-icon {
                font-size: ${this.getIconSize()};
                z-index: 1;
                position: relative;
            }

            /* Quick Actions */
            .floating-quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 12px;
            }

            .floating-quick-btn {
                background: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 6px 10px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                color: #374151;
            }

            .floating-quick-btn:hover {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            @media (max-width: 768px) {
                .floating-chatbot {
                    bottom: 15px;
                    right: 15px;
                }

                .floating-chatbot-button {
                    width: 50px;
                    height: 50px;
                }

                .floating-chatbot-icon {
                    font-size: 20px;
                }

                .floating-chatbot-window {
                    width: calc(100vw - 30px);
                    height: calc(100vh - 120px);
                    right: 15px;
                    bottom: 75px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Get position styles based on options
     */
    getPositionStyles() {
        const positions = {
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;'
        };
        return positions[this.options.position] || positions['bottom-right'];
    }

    /**
     * Get size styles based on options
     */
    getSizeStyles() {
        const sizes = {
            'small': 'width: 50px; height: 50px;',
            'medium': 'width: 60px; height: 60px;',
            'large': 'width: 70px; height: 70px;'
        };
        return sizes[this.options.size] || sizes['medium'];
    }

    /**
     * Get theme styles based on options
     */
    getThemeStyles() {
        const themes = {
            'blue': 'background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);',
            'green': 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);',
            'purple': 'background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);',
            'red': 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);'
        };
        return themes[this.options.theme] || themes['blue'];
    }

    /**
     * Get hover styles based on theme
     */
    getHoverStyles() {
        const hoverStyles = {
            'blue': 'box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);',
            'green': 'box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);',
            'purple': 'box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);',
            'red': 'box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);'
        };
        return hoverStyles[this.options.theme] || hoverStyles['blue'];
    }

    /**
     * Get tooltip position based on chatbot position
     */
    getTooltipPosition() {
        const positions = {
            'bottom-right': 'bottom: 70px; right: 0;',
            'bottom-left': 'bottom: 70px; left: 0;',
            'top-right': 'top: 70px; right: 0;',
            'top-left': 'top: 70px; left: 0;'
        };
        return positions[this.options.position] || positions['bottom-right'];
    }

    /**
     * Get icon size based on button size
     */
    getIconSize() {
        const sizes = {
            'small': '18px',
            'medium': '24px',
            'large': '28px'
        };
        return sizes[this.options.size] || sizes['medium'];
    }

    /**
     * Create HTML structure
     */
    createHTML() {
        // Remove existing chatbot if any
        const existing = document.getElementById('floating-chatbot');
        if (existing) {
            existing.remove();
        }

        const chatbotDiv = document.createElement('div');
        chatbotDiv.id = 'floating-chatbot';
        chatbotDiv.className = 'floating-chatbot';

        if (this.options.inlineMode) {
            chatbotDiv.innerHTML = `
                <button class="floating-chatbot-button" id="floating-chatbot-button">
                    <div class="floating-chatbot-pulse"></div>
                    <i class="fas fa-robot floating-chatbot-icon"></i>
                    <div class="floating-chatbot-tooltip">${this.options.tooltip}</div>
                </button>

                <div class="floating-chatbot-window" id="floating-chatbot-window">
                    <div class="floating-chatbot-header">
                        <div>
                            <h3>Gemini AI Assistant</h3>
                            <p>Trợ lý du lịch Trà Vinh</p>
                        </div>
                        <button class="floating-chatbot-close" id="floating-chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="floating-chatbot-messages" id="floating-chatbot-messages">
                        <div class="floating-quick-actions">
                            <button class="floating-quick-btn" onclick="window.floatingChatbot.sendQuickMessage('địa điểm nổi tiếng')">🏛️ Địa điểm</button>
                            <button class="floating-quick-btn" onclick="window.floatingChatbot.sendQuickMessage('ẩm thực đặc sản')">🍜 Ẩm thực</button>
                            <button class="floating-quick-btn" onclick="window.floatingChatbot.sendQuickMessage('chi phí')">💰 Chi phí</button>
                            <button class="floating-quick-btn" onclick="window.floatingChatbot.sendQuickMessage('cách đi')">🚗 Cách đi</button>
                        </div>

                        <div class="floating-message ai">
                            <div class="floating-message-bubble ai">
                                👋 Xin chào! Tôi là Gemini AI, trợ lý du lịch Trà Vinh. Tôi có thể giúp bạn tìm hiểu về địa điểm, ẩm thực và lập kế hoạch du lịch. Hãy hỏi tôi bất cứ điều gì!
                            </div>
                        </div>
                    </div>

                    <div class="floating-chatbot-input-area">
                        <div style="position: relative;">
                            <textarea class="floating-chatbot-input"
                                     id="floating-chatbot-input"
                                     placeholder="Nhập câu hỏi của bạn..."
                                     rows="1"></textarea>
                            <button class="floating-chatbot-send"
                                   id="floating-chatbot-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            chatbotDiv.innerHTML = `
                <button class="floating-chatbot-button" id="floating-chatbot-button">
                    <div class="floating-chatbot-pulse"></div>
                    <i class="fas fa-robot floating-chatbot-icon"></i>
                    <div class="floating-chatbot-tooltip">${this.options.tooltip}</div>
                </button>
            `;
        }

        document.body.appendChild(chatbotDiv);
    }

    /**
     * Bind events
     */
    bindEvents() {
        const button = document.getElementById('floating-chatbot-button');
        if (button) {
            if (this.options.inlineMode) {
                button.addEventListener('click', () => this.toggleChatbot());
            } else {
                button.addEventListener('click', () => this.openChatbot());
            }
        }

        if (this.options.inlineMode) {
            // Close button
            const closeBtn = document.getElementById('floating-chatbot-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeChatbot());
            }

            // Send button
            const sendBtn = document.getElementById('floating-chatbot-send');
            if (sendBtn) {
                sendBtn.addEventListener('click', () => this.sendMessage());
            }

            // Input field
            const input = document.getElementById('floating-chatbot-input');
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });

                input.addEventListener('input', () => this.autoResizeInput());
            }
        }
    }

    /**
     * Toggle inline chatbot window
     */
    toggleChatbot() {
        if (this.options.inlineMode) {
            this.isOpen = !this.isOpen;
            const window = document.getElementById('floating-chatbot-window');

            if (this.isOpen) {
                window.classList.add('active');
                const input = document.getElementById('floating-chatbot-input');
                if (input) {
                    setTimeout(() => input.focus(), 300);
                }
                console.log('💬 Inline chatbot opened');
            } else {
                window.classList.remove('active');
                console.log('💬 Inline chatbot closed');
            }
        } else {
            this.openChatbot();
        }
    }

    /**
     * Close inline chatbot
     */
    closeChatbot() {
        this.isOpen = false;
        const window = document.getElementById('floating-chatbot-window');
        if (window) {
            window.classList.remove('active');
        }
    }

    /**
     * Open chatbot in new window (fallback)
     */
    openChatbot() {
        try {
            const chatWindow = window.open(
                this.options.chatbotUrl,
                'gemini-chatbot',
                this.options.windowFeatures
            );

            if (chatWindow) {
                chatWindow.focus();
                console.log('🚀 Chatbot window opened');
            } else {
                // Fallback: open in same tab
                window.location.href = this.options.chatbotUrl;
            }
        } catch (error) {
            console.error('Failed to open chatbot:', error);
            // Fallback: open in same tab
            window.location.href = this.options.chatbotUrl;
        }
    }

    /**
     * Update tooltip text
     */
    updateTooltip(text) {
        const tooltip = document.querySelector('.floating-chatbot-tooltip');
        if (tooltip) {
            tooltip.textContent = text;
        }
    }

    /**
     * Show/hide chatbot
     */
    toggle(show = null) {
        const chatbot = document.getElementById('floating-chatbot');
        if (chatbot) {
            if (show === null) {
                chatbot.style.display = chatbot.style.display === 'none' ? 'block' : 'none';
            } else {
                chatbot.style.display = show ? 'block' : 'none';
            }
        }
    }

    /**
     * Send message
     */
    async sendMessage() {
        if (!this.options.inlineMode) return;

        const input = document.getElementById('floating-chatbot-input');
        const message = input.value.trim();

        if (!message || this.isTyping) {
            return;
        }

        // Clear input
        input.value = '';
        this.autoResizeInput();

        // Add user message
        this.addMessage('user', message);
        this.showTypingIndicator();

        try {
            let response;

            // Check cache first
            if (window.responseCache && window.responseCache.has(message)) {
                response = window.responseCache.get(message);
                console.log('⚡ Using cached response');
                await this.delay(300);
            } else if (window.responseCache) {
                response = window.responseCache.findSimilar(message);
                if (response) {
                    console.log('🎯 Using similar cached response');
                    await this.delay(500);
                }
            }

            // If no cache hit, call API
            if (!response) {
                response = await this.callGeminiAPI(message);
                if (window.responseCache) {
                    window.responseCache.set(message, response);
                }
            }

            this.hideTypingIndicator();
            this.addMessage('ai', response);

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
        if (!this.options.inlineMode) return;

        const input = document.getElementById('floating-chatbot-input');
        if (input) {
            input.value = message;
            this.sendMessage();
        }
    }

    /**
     * Add message to chat
     */
    addMessage(type, content) {
        const messagesContainer = document.getElementById('floating-chatbot-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `floating-message ${type}`;

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="floating-message-bubble user">
                    ${this.escapeHtml(content)}
                </div>
            `;
        } else if (type === 'ai') {
            messageDiv.innerHTML = `
                <div class="floating-message-bubble ai">
                    ${this.formatResponse(content)}
                </div>
            `;
        } else if (type === 'error') {
            messageDiv.innerHTML = `
                <div class="floating-message-bubble ai" style="background: #fef2f2; border-color: #fecaca; color: #dc2626;">
                    ${this.escapeHtml(content)}
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Store message
        this.messages.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('floating-chatbot-messages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'floating-typing-indicator';
        typingDiv.className = 'floating-message ai';
        typingDiv.innerHTML = `
            <div class="floating-typing-indicator">
                <div class="floating-typing-dot"></div>
                <div class="floating-typing-dot"></div>
                <div class="floating-typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('floating-typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Auto resize input
     */
    autoResizeInput() {
        const input = document.getElementById('floating-chatbot-input');
        if (input) {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 80) + 'px';
        }
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('floating-chatbot-messages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * Load API key
     */
    loadApiKey() {
        return localStorage.getItem('gemini_api_key') || '';
    }

    /**
     * Call Gemini API
     */
    async callGeminiAPI(message) {
        if (!this.apiKey || this.apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY') {
            throw new Error('API key chưa được cấu hình. Vui lòng mở chatbot đầy đủ để cấu hình API key.');
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: `Bạn là chuyên gia du lịch Trà Vinh. Trả lời NGẮN GỌN (tối đa 100 từ) về: ${message}`
                }]
            }]
        };

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'API request failed'}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response format from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Format response
     */
    formatResponse(content) {
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 4px;">$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destroy chatbot
     */
    destroy() {
        const chatbot = document.getElementById('floating-chatbot');
        const styles = document.getElementById('floating-chatbot-styles');

        if (chatbot) chatbot.remove();
        if (styles) styles.remove();

        console.log('🗑️ Floating Chatbot destroyed');
    }
}

// Auto-initialize if not in chatbot page
document.addEventListener('DOMContentLoaded', function() {
    // Don't initialize on chatbot pages
    if (window.location.pathname.includes('chatbot') || 
        window.location.pathname.includes('test-gemini') ||
        window.location.pathname.includes('api-key-manager')) {
        return;
    }
    
    // Initialize floating chatbot
    window.floatingChatbot = new FloatingChatbot({
        position: 'bottom-right',
        size: 'medium',
        theme: 'blue',
        tooltip: 'Chat với AI Gemini'
    });
});

// Export for manual initialization
window.FloatingChatbot = FloatingChatbot;
