/**
 * Enhanced AI Chatbot with Gemini 2.0 Integration
 * Chatbot nâng cao tích hợp Gemini AI
 */

class EnhancedAIChatbot {
    constructor(containerId = 'aiChatbotContainer') {
        this.containerId = containerId;
        this.isOpen = false;
        this.isTyping = false;
        this.aiService = new GeminiAIService();
        this.messageQueue = [];
        this.currentPageType = getCurrentPageType();
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.showWelcomeMessage();
        
        console.log(`🤖 Enhanced AI Chatbot initialized for page: ${this.currentPageType}`);
        console.log(`🔑 API Status: ${this.aiService.isReady() ? 'Ready' : 'Mock Mode'}`);
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="ai-chatbot-container" id="${this.containerId}">
                <!-- Toggle Button -->
                <button class="ai-chatbot-toggle" id="aiChatbotToggle" aria-label="Mở AI Chatbot">
                    <div class="ai-chatbot-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-status-indicator ${this.aiService.isReady() ? 'online' : 'offline'}"></div>
                    <div class="ai-pulse-ring"></div>
                </button>
                
                <!-- Chatbot Window -->
                <div class="ai-chatbot-window" id="aiChatbotWindow">
                    <!-- Header -->
                    <div class="ai-chatbot-header">
                        <div class="ai-header-content">
                            <div class="ai-avatar-container">
                                <div class="ai-chatbot-avatar">
                                    <i class="fas fa-brain"></i>
                                    <div class="ai-thinking-indicator" id="aiThinkingIndicator" style="display: none;">
                                        <div class="ai-thinking-dot"></div>
                                        <div class="ai-thinking-dot"></div>
                                        <div class="ai-thinking-dot"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="ai-header-text">
                                <h3 class="ai-chatbot-title">AI Trợ lý Trà Vinh</h3>
                                <p class="ai-chatbot-subtitle">
                                    <span class="ai-status-text">${this.aiService.isReady() ? 'Powered by Gemini 2.0' : 'Demo Mode'}</span>
                                </p>
                            </div>
                            <div class="ai-header-actions">
                                <button class="ai-action-btn" id="aiClearHistory" title="Xóa lịch sử">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="ai-action-btn" id="aiCloseBtn" title="Đóng">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Messages Area -->
                    <div class="ai-chatbot-messages" id="aiChatbotMessages">
                        <div class="ai-quick-actions" id="aiQuickActions">
                            ${this.generateQuickActions()}
                        </div>
                        <div class="ai-messages-container" id="aiMessagesContainer">
                            <!-- Messages will be added here -->
                        </div>
                    </div>
                    
                    <!-- Input Area -->
                    <div class="ai-chatbot-input-area">
                        <div class="ai-input-container">
                            <textarea class="ai-chatbot-input" 
                                     id="aiChatbotInput" 
                                     placeholder="Hỏi AI về du lịch Trà Vinh..." 
                                     rows="1"
                                     maxlength="1000"></textarea>
                            <button class="ai-send-button" id="aiSendButton" disabled>
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="ai-input-footer">
                            <span class="ai-char-count" id="aiCharCount">0/1000</span>
                            <span class="ai-powered-by">
                                <i class="fas fa-magic"></i>
                                Powered by ${this.aiService.isReady() ? 'Gemini 2.0' : 'Demo AI'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert into DOM
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    generateQuickActions() {
        const quickActions = {
            'index': [
                { icon: '🏛️', text: 'Giới thiệu Trà Vinh', message: 'Giới thiệu tổng quan về Trà Vinh' },
                { icon: '🗺️', text: 'Địa điểm nổi tiếng', message: 'Những địa điểm du lịch nổi tiếng ở Trà Vinh' },
                { icon: '🍜', text: 'Ẩm thực đặc sản', message: 'Các món ăn đặc sản của Trà Vinh' },
                { icon: '📋', text: 'Lập kế hoạch', message: 'Giúp tôi lập kế hoạch du lịch Trà Vinh' }
            ],
            'dia-diem': [
                { icon: '🔍', text: 'Tìm địa điểm', message: 'Tìm địa điểm du lịch phù hợp với tôi' },
                { icon: '🏛️', text: 'Chùa Khmer', message: 'Thông tin về các chùa Khmer nổi tiếng' },
                { icon: '🌊', text: 'Ao Bà Om', message: 'Thông tin chi tiết về Ao Bà Om' },
                { icon: '📍', text: 'Lịch trình', message: 'Gợi ý lịch trình tham quan 1-2 ngày' }
            ],
            'gioi-thieu': [
                { icon: '📜', text: 'Lịch sử', message: 'Lịch sử hình thành và phát triển của Trà Vinh' },
                { icon: '🎭', text: 'Văn hóa Khmer', message: 'Văn hóa và truyền thống của người Khmer' },
                { icon: '🎪', text: 'Lễ hội', message: 'Các lễ hội truyền thống ở Trà Vinh' },
                { icon: '🏗️', text: 'Kiến trúc', message: 'Kiến trúc chùa Khmer độc đáo' }
            ],
            'lien-he': [
                { icon: '📞', text: 'Liên hệ', message: 'Thông tin liên hệ và đặt tour' },
                { icon: '🎯', text: 'Đặt tour', message: 'Hướng dẫn đặt tour du lịch' },
                { icon: '💬', text: 'Hỗ trợ', message: 'Tôi cần hỗ trợ về dịch vụ du lịch' },
                { icon: '💡', text: 'Tư vấn', message: 'Tư vấn gói du lịch phù hợp' }
            ],
            'danh-gia': [
                { icon: '⭐', text: 'Viết review', message: 'Hướng dẫn viết đánh giá chất lượng' },
                { icon: '📝', text: 'Chia sẻ', message: 'Cách chia sẻ trải nghiệm du lịch' },
                { icon: '📸', text: 'Chụp ảnh', message: 'Tips chụp ảnh đẹp ở Trà Vinh' },
                { icon: '💡', text: 'Tips', message: 'Mẹo hay cho chuyến du lịch' }
            ]
        };

        const actions = quickActions[this.currentPageType] || quickActions['index'];
        
        return actions.map(action => `
            <button class="ai-quick-action-btn" 
                    onclick="window.aiChatbot.sendQuickMessage('${action.message}')"
                    title="${action.message}">
                <span class="ai-action-icon">${action.icon}</span>
                <span class="ai-action-text">${action.text}</span>
            </button>
        `).join('');
    }

    bindEvents() {
        // Toggle button
        document.getElementById('aiChatbotToggle').addEventListener('click', () => this.toggle());
        
        // Close button
        document.getElementById('aiCloseBtn').addEventListener('click', () => this.close());
        
        // Clear history button
        document.getElementById('aiClearHistory').addEventListener('click', () => this.clearHistory());
        
        // Send button
        document.getElementById('aiSendButton').addEventListener('click', () => this.sendMessage());
        
        // Input events
        const input = document.getElementById('aiChatbotInput');
        input.addEventListener('input', () => this.handleInputChange());
        input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Auto-resize textarea
        input.addEventListener('input', () => this.autoResizeTextarea());
        
        // Outside click to close
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('aiChatbotWindow');
        const toggle = document.getElementById('aiChatbotToggle');
        
        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
            setTimeout(() => {
                document.getElementById('aiChatbotInput').focus();
            }, 300);
        } else {
            this.close();
        }
    }

    close() {
        const window = document.getElementById('aiChatbotWindow');
        const toggle = document.getElementById('aiChatbotToggle');
        
        window.classList.remove('active');
        toggle.classList.remove('active');
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('aiChatbotInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        this.updateSendButton();
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const pageContext = `Trang ${this.currentPageType} - Du lịch Trà Vinh`;
            const response = await this.aiService.sendMessage(message, pageContext);
            
            // Hide typing indicator and show response
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('AI Response Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.', 'ai', true);
        }
    }

    sendQuickMessage(message) {
        const input = document.getElementById('aiChatbotInput');
        input.value = message;
        this.updateSendButton();
        this.sendMessage();
    }

    addMessage(text, sender, isError = false) {
        const container = document.getElementById('aiMessagesContainer');
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const messageHTML = `
            <div class="ai-message ai-message-${sender} ${isError ? 'ai-message-error' : ''}" id="${messageId}">
                ${sender === 'ai' ? `
                    <div class="ai-message-avatar">
                        <i class="fas fa-${isError ? 'exclamation-triangle' : 'brain'}"></i>
                    </div>
                ` : ''}
                <div class="ai-message-bubble ${sender}">
                    <div class="ai-message-content">${this.formatMessage(text)}</div>
                    <div class="ai-message-time">${this.formatTime(new Date())}</div>
                </div>
                ${sender === 'user' ? `
                    <div class="ai-message-avatar ai-user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                ` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    formatTime(date) {
        return date.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    showTypingIndicator() {
        this.isTyping = true;
        document.getElementById('aiThinkingIndicator').style.display = 'flex';
        
        const container = document.getElementById('aiMessagesContainer');
        const typingHTML = `
            <div class="ai-message ai-message-ai ai-typing-indicator" id="aiTypingIndicator">
                <div class="ai-message-avatar">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="ai-message-bubble ai">
                    <div class="ai-typing-animation">
                        <div class="ai-typing-dot"></div>
                        <div class="ai-typing-dot"></div>
                        <div class="ai-typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        document.getElementById('aiThinkingIndicator').style.display = 'none';
        
        const typingIndicator = document.getElementById('aiTypingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            const welcomeMessages = {
                'index': '🏛️ Xin chào! Tôi là AI trợ lý du lịch Trà Vinh. Tôi có thể giúp bạn khám phá vẻ đẹp của vùng đất này!',
                'dia-diem': '🗺️ Chào bạn! Tôi có thể giúp bạn tìm kiếm và khám phá các địa điểm du lịch tuyệt vời ở Trà Vinh.',
                'gioi-thieu': '📚 Xin chào! Tôi có thể chia sẻ với bạn về lịch sử, văn hóa và con người Trà Vinh.',
                'lien-he': '📞 Chào bạn! Tôi có thể hỗ trợ bạn về thông tin liên hệ và đặt tour du lịch.',
                'danh-gia': '⭐ Xin chào! Tôi có thể hướng dẫn bạn viết đánh giá và chia sẻ trải nghiệm du lịch.'
            };
            
            const welcomeMessage = welcomeMessages[this.currentPageType] || welcomeMessages['index'];
            this.addMessage(welcomeMessage, 'ai');
        }, 1000);
    }

    handleInputChange() {
        const input = document.getElementById('aiChatbotInput');
        const charCount = document.getElementById('aiCharCount');
        
        charCount.textContent = `${input.value.length}/1000`;
        this.updateSendButton();
    }

    updateSendButton() {
        const input = document.getElementById('aiChatbotInput');
        const button = document.getElementById('aiSendButton');
        
        button.disabled = input.value.trim() === '' || this.isTyping;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('aiChatbotInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    scrollToBottom() {
        const messagesArea = document.getElementById('aiChatbotMessages');
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    clearHistory() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử hội thoại?')) {
            document.getElementById('aiMessagesContainer').innerHTML = '';
            this.aiService.clearHistory();
            this.showWelcomeMessage();
        }
    }

    handleOutsideClick(e) {
        const chatbotContainer = document.getElementById(this.containerId);
        if (!chatbotContainer.contains(e.target) && this.isOpen) {
            // Uncomment to enable click-outside-to-close
            // this.close();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for dependencies to load
    if (typeof GeminiAIService !== 'undefined' && typeof GEMINI_CONFIG !== 'undefined') {
        window.aiChatbot = new EnhancedAIChatbot();
    } else {
        console.error('❌ Missing dependencies: GeminiAIService or GEMINI_CONFIG');
    }
});

// Export for global access
window.EnhancedAIChatbot = EnhancedAIChatbot;
