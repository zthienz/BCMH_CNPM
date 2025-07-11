/**
 * AI Chatbot Component - Reusable across all pages
 * Usage: new ChatbotComponent(config)
 */

class ChatbotComponent {
    constructor(config = {}) {
        this.config = {
            // Default configuration
            position: 'bottom-right',
            theme: 'default',
            apiUrl: 'http://localhost:3001',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            enableQuickActions: true,
            enableTypingIndicator: true,
            enableSoundEffects: false,
            maxMessages: 50,
            typingDelay: 1500,
            // Override with user config
            ...config
        };

        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.currentPage = this.detectCurrentPage();
        this.messageHistory = this.loadMessageHistory();
        
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.loadPageSpecificConfig();
        
        if (this.config.showWelcome) {
            this.showWelcomeMessage();
        }
        
        if (this.config.autoShow) {
            setTimeout(() => this.toggleChatbot(), 2000);
        }
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '') || 'index';
        return filename;
    }

    loadPageSpecificConfig() {
        const pageConfigs = {
            'index': {
                title: 'Trợ lý Du lịch Trà Vinh',
                subtitle: 'Khám phá vẻ đẹp Trà Vinh',
                quickActions: [
                    { text: 'Giới thiệu Trà Vinh', message: 'Giới thiệu về Trà Vinh' },
                    { text: 'Địa điểm nổi tiếng', message: 'Địa điểm du lịch nổi tiếng' },
                    { text: 'Lên kế hoạch', message: 'Lập kế hoạch du lịch' },
                    { text: 'Ẩm thực đặc sản', message: 'Ẩm thực đặc sản Trà Vinh' }
                ]
            },
            'dia-diem': {
                title: 'Hỗ trợ Địa điểm',
                subtitle: 'Tìm kiếm & khám phá',
                quickActions: [
                    { text: 'Tìm địa điểm', message: 'Tìm địa điểm du lịch' },
                    { text: 'Lọc theo loại', message: 'Lọc địa điểm theo loại hình' },
                    { text: 'Gợi ý lịch trình', message: 'Gợi ý lịch trình tham quan' },
                    { text: 'Đánh giá địa điểm', message: 'Đánh giá và review địa điểm' }
                ]
            },
            'check-db-images': {
                title: 'Hỗ trợ Admin',
                subtitle: 'Quản lý hệ thống',
                quickActions: [
                    { text: 'Hướng dẫn sử dụng', message: 'Hướng dẫn sử dụng trang admin' },
                    { text: 'Báo lỗi', message: 'Báo cáo lỗi hệ thống' },
                    { text: 'Hỗ trợ kỹ thuật', message: 'Cần hỗ trợ kỹ thuật' },
                    { text: 'Thống kê', message: 'Xem thống kê hệ thống' }
                ]
            },
            'test-images': {
                title: 'Hỗ trợ Test',
                subtitle: 'Kiểm tra hệ thống',
                quickActions: [
                    { text: 'Kiểm tra hình ảnh', message: 'Kiểm tra tình trạng hình ảnh' },
                    { text: 'Báo lỗi hình ảnh', message: 'Báo cáo lỗi hình ảnh' },
                    { text: 'Hỗ trợ', message: 'Cần hỗ trợ kỹ thuật' },
                    { text: 'Test API', message: 'Kiểm tra API endpoints' }
                ]
            },
            'demo-animations': {
                title: 'Demo Assistant',
                subtitle: 'Hướng dẫn & giải thích',
                quickActions: [
                    { text: 'Giải thích animation', message: 'Giải thích các hiệu ứng animation' },
                    { text: 'Hướng dẫn sử dụng', message: 'Hướng dẫn sử dụng giao diện' },
                    { text: 'Tùy chỉnh giao diện', message: 'Cách tùy chỉnh giao diện' },
                    { text: 'Code examples', message: 'Ví dụ code và implementation' }
                ]
            },
            'status': {
                title: 'System Monitor',
                subtitle: 'Giám sát hệ thống',
                quickActions: [
                    { text: 'Kiểm tra hệ thống', message: 'Kiểm tra tình trạng hệ thống' },
                    { text: 'Báo cáo lỗi', message: 'Báo cáo lỗi hệ thống' },
                    { text: 'Hỗ trợ kỹ thuật', message: 'Cần hỗ trợ kỹ thuật' },
                    { text: 'Logs & Analytics', message: 'Xem logs và phân tích' }
                ]
            },
            'gioi-thieu': {
                title: 'Hỗ trợ Giới thiệu',
                subtitle: 'Tìm hiểu về Trà Vinh',
                quickActions: [
                    { text: 'Lịch sử Trà Vinh', message: 'Lịch sử hình thành Trà Vinh' },
                    { text: 'Văn hóa Khmer', message: 'Văn hóa người Khmer ở Trà Vinh' },
                    { text: 'Đặc sản địa phương', message: 'Đặc sản nổi tiếng Trà Vinh' },
                    { text: 'Lễ hội truyền thống', message: 'Các lễ hội truyền thống' }
                ]
            },
            'lien-he': {
                title: 'Hỗ trợ Liên hệ',
                subtitle: 'Kết nối với chúng tôi',
                quickActions: [
                    { text: 'Thông tin liên hệ', message: 'Thông tin liên hệ chi tiết' },
                    { text: 'Đặt tour du lịch', message: 'Hướng dẫn đặt tour' },
                    { text: 'Hỗ trợ khách hàng', message: 'Cần hỗ trợ khách hàng' },
                    { text: 'Góp ý dịch vụ', message: 'Góp ý cải thiện dịch vụ' }
                ]
            },
            'danh-gia': {
                title: 'Hỗ trợ Đánh giá',
                subtitle: 'Reviews & Bài viết',
                quickActions: [
                    { text: 'Viết đánh giá', message: 'Hướng dẫn viết đánh giá' },
                    { text: 'Chia sẻ trải nghiệm', message: 'Chia sẻ trải nghiệm du lịch' },
                    { text: 'Xem review khác', message: 'Xem đánh giá từ du khách khác' },
                    { text: 'Tips du lịch', message: 'Mẹo hay cho chuyến du lịch' }
                ]
            },
            'admin-db': {
                title: 'Database Admin',
                subtitle: 'Quản lý cơ sở dữ liệu',
                quickActions: [
                    { text: 'Kiểm tra kết nối', message: 'Kiểm tra kết nối database' },
                    { text: 'Backup dữ liệu', message: 'Hướng dẫn backup database' },
                    { text: 'Thống kê dữ liệu', message: 'Xem thống kê database' },
                    { text: 'Hỗ trợ SQL', message: 'Hỗ trợ viết câu lệnh SQL' }
                ]
            },
            'admin-images': {
                title: 'Image Admin',
                subtitle: 'Quản lý hình ảnh',
                quickActions: [
                    { text: 'Upload hình ảnh', message: 'Hướng dẫn upload hình ảnh' },
                    { text: 'Tối ưu hình ảnh', message: 'Cách tối ưu hóa hình ảnh' },
                    { text: 'Kiểm tra lỗi ảnh', message: 'Kiểm tra lỗi hình ảnh' },
                    { text: 'Quản lý storage', message: 'Quản lý dung lượng lưu trữ' }
                ]
            },
            'check-images': {
                title: 'Image Checker',
                subtitle: 'Kiểm tra hình ảnh',
                quickActions: [
                    { text: 'Scan tất cả ảnh', message: 'Quét kiểm tra tất cả hình ảnh' },
                    { text: 'Báo cáo lỗi ảnh', message: 'Báo cáo hình ảnh bị lỗi' },
                    { text: 'Sửa đường dẫn', message: 'Sửa đường dẫn hình ảnh' },
                    { text: 'Thống kê ảnh', message: 'Thống kê tình trạng hình ảnh' }
                ]
            }
        };

        const pageConfig = pageConfigs[this.currentPage] || pageConfigs['index'];
        this.pageConfig = pageConfig;
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div class="chatbot-component" id="chatbotComponent">
                <button class="chatbot-toggle" id="chatbotToggle" aria-label="Mở trợ lý AI">
                    <div class="chatbot-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="notification-badge" id="notificationBadge" style="display: none;">
                        <span id="notificationCount">1</span>
                    </div>
                    <div class="pulse-ring"></div>
                </button>
                
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <div class="header-content">
                            <div class="avatar-container">
                                <div class="chatbot-avatar">
                                    <i class="fas fa-robot"></i>
                                    <div class="status-indicator"></div>
                                </div>
                            </div>
                            <div class="header-text">
                                <h3 class="chatbot-title">${this.pageConfig.title}</h3>
                                <p class="chatbot-subtitle">${this.pageConfig.subtitle}</p>
                            </div>
                            <button class="close-button" id="closeChatbot" aria-label="Đóng">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="header-shimmer"></div>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="quick-actions" id="quickActions">
                            ${this.generateQuickActions()}
                        </div>
                        <div class="messages-container" id="messagesContainer">
                            <!-- Messages will be added here -->
                        </div>
                    </div>
                    
                    <div class="chatbot-input-area">
                        <div class="input-container">
                            <input type="text" 
                                   class="chatbot-input" 
                                   id="chatbotInput" 
                                   placeholder="Nhập câu hỏi của bạn..." 
                                   maxlength="500"
                                   autocomplete="off">
                            <button class="send-button" id="sendButton" aria-label="Gửi tin nhắn">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="input-suggestions" id="inputSuggestions" style="display: none;">
                            <!-- Suggestions will be added here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert into DOM
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    generateQuickActions() {
        return this.pageConfig.quickActions.map(action => `
            <button class="quick-action-btn" 
                    onclick="window.chatbotInstance.sendQuickMessage('${action.message}')"
                    title="${action.message}">
                <i class="fas fa-magic"></i>
                ${action.text}
            </button>
        `).join('');
    }

    bindEvents() {
        const toggle = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('closeChatbot');
        const sendButton = document.getElementById('sendButton');
        const chatInput = document.getElementById('chatbotInput');

        // Toggle chatbot
        toggle.addEventListener('click', () => this.toggleChatbot());
        closeBtn.addEventListener('click', () => this.closeChatbot());

        // Send message
        sendButton.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input events
        chatInput.addEventListener('input', () => this.handleInputChange());
        chatInput.addEventListener('focus', () => this.handleInputFocus());
        chatInput.addEventListener('blur', () => this.handleInputBlur());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Click outside to close
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Window resize
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');
        const badge = document.getElementById('notificationBadge');

        if (this.isOpen) {
            window.classList.add('active');
            toggle.classList.add('active');
            badge.style.display = 'none';
            
            // Focus input after animation
            setTimeout(() => {
                document.getElementById('chatbotInput').focus();
            }, 300);

            // Track analytics
            this.trackEvent('chatbot_opened');
        } else {
            this.closeChatbot();
        }
    }

    closeChatbot() {
        const window = document.getElementById('chatbotWindow');
        const toggle = document.getElementById('chatbotToggle');
        
        window.classList.remove('active');
        toggle.classList.remove('active');
        this.isOpen = false;

        // Track analytics
        this.trackEvent('chatbot_closed');
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (message === '') return;

        this.addMessage(message, 'user');
        input.value = '';
        this.updateSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        // Generate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, this.config.typingDelay + Math.random() * 1000);

        // Track analytics
        this.trackEvent('message_sent', { message_length: message.length });
    }

    sendQuickMessage(message) {
        this.addMessage(message, 'user');
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, 1000);

        // Track analytics
        this.trackEvent('quick_action_used', { action: message });
    }

    addMessage(text, sender, options = {}) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const messageHTML = `
            <div class="message message-${sender}" id="${messageId}" data-sender="${sender}">
                ${sender === 'ai' ? `
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                ` : ''}
                <div class="message-bubble ${sender}">
                    <div class="message-content">${this.formatMessage(text)}</div>
                    <div class="message-time">${this.formatTime(new Date())}</div>
                    ${options.showActions ? this.generateMessageActions(messageId) : ''}
                </div>
                ${sender === 'user' ? `
                    <div class="message-avatar user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                ` : ''}
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);

        // Store message
        this.messages.push({
            id: messageId,
            text: text,
            sender: sender,
            timestamp: new Date(),
            page: this.currentPage
        });

        // Limit message history
        if (this.messages.length > this.config.maxMessages) {
            this.messages = this.messages.slice(-this.config.maxMessages);
        }

        this.scrollToBottom();
        this.saveMessageHistory();
    }

    formatMessage(text) {
        // Convert markdown-like formatting
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
        const messagesContainer = document.getElementById('messagesContainer');
        const typingHTML = `
            <div class="message message-ai typing-indicator" id="typingIndicator">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble ai">
                    <div class="typing-animation">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        this.isTyping = true;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    generateAIResponse(userMessage) {
        const response = this.getContextualResponse(userMessage.toLowerCase());
        this.addMessage(response, 'ai', { showActions: true });
    }

    getContextualResponse(message) {
        // Page-specific responses
        const pageResponses = this.getPageSpecificResponses(message);
        if (pageResponses.length > 0) {
            return pageResponses[Math.floor(Math.random() * pageResponses.length)];
        }

        // General responses
        const generalResponses = this.getGeneralResponses(message);
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    getPageSpecificResponses(message) {
        const responses = {
            'index': {
                'giới thiệu': [
                    '🏛️ **Trà Vinh - Vùng đất của văn hóa Khmer**\n\nTrà Vinh là tỉnh ven biển thuộc vùng đồng bằng sông Cửu Long, nổi tiếng với:\n\n• **Văn hóa đa dạng:** Kinh - Khmer - Hoa\n• **Kiến trúc độc đáo:** Hơn 140 ngôi chùa Khmer\n• **Thiên nhiên tươi đẹp:** Cù lao, rừng tràm\n• **Ẩm thực phong phú:** Đặc sản miền Tây Nam Bộ'
                ],
                'kế hoạch': [
                    '📋 **Lập kế hoạch du lịch Trà Vinh:**\n\n**Thời gian lý tưởng:** Tháng 11 - 4 (mùa khô)\n\n**Gợi ý lịch trình:**\n• **1 ngày:** Trung tâm thành phố + chùa Khmer\n• **2-3 ngày:** Thêm cù lao + sinh thái\n• **4-5 ngày:** Khám phá toàn diện'
                ]
            },
            'dia-diem': {
                'tìm': [
                    '🔍 **Tìm kiếm địa điểm:**\n\nBạn có thể:\n• Dùng ô tìm kiếm phía trên\n• Lọc theo loại hình du lịch\n• Xem tất cả địa điểm trên bản đồ\n\nHiện tại có **15 địa điểm** được cập nhật với hình ảnh đẹp.'
                ],
                'lọc': [
                    '🏷️ **Lọc địa điểm theo loại:**\n\n• **🌿 Du lịch sinh thái:** Rừng tràm, cù lao\n• **🏔️ Thắng cảnh thiên nhiên:** Ao Bà Om, biển\n• **🏛️ Lịch sử - tâm linh:** Chùa Khmer, bảo tàng'
                ]
            },
            'gioi-thieu': {
                'lịch sử': [
                    '📜 **Lịch sử Trà Vinh:**\n\nTrà Vinh được thành lập năm 1976, là vùng đất có lịch sử lâu đời với:\n\n• **Thế kỷ 7-10:** Thuộc vương quốc Phù Nam\n• **Thế kỷ 10-19:** Thuộc đế chế Khmer\n• **1976:** Thành lập tỉnh Trà Vinh\n\nĐây là nơi giao thoa văn hóa Kinh - Khmer - Hoa độc đáo.'
                ],
                'văn hóa': [
                    '🏛️ **Văn hóa Khmer ở Trà Vinh:**\n\n• **Kiến trúc:** Hơn 140 ngôi chùa Khmer cổ kính\n• **Lễ hội:** Ok Om Bok, Chol Chnam Thmay\n• **Nghệ thuật:** Múa Robam, nhạc cụ truyền thống\n• **Ẩm thực:** Bánh ít lá gai, cà ri gà Khmer'
                ]
            },
            'lien-he': {
                'liên hệ': [
                    '📞 **Thông tin liên hệ:**\n\n• **Hotline:** 0294.385.5555\n• **Email:** info@dulichtravinh.vn\n• **Địa chỉ:** 95 Điện Biên Phủ, TP. Trà Vinh\n• **Website:** www.dulichtravinh.vn\n\n**Giờ làm việc:** 7:30 - 17:30 (T2-T6)'
                ],
                'tour': [
                    '🎯 **Đặt tour du lịch:**\n\n**Các gói tour phổ biến:**\n• Tour 1 ngày: 500.000đ/người\n• Tour 2 ngày 1 đêm: 1.200.000đ/người\n• Tour sinh thái: 800.000đ/người\n\n**Liên hệ đặt tour:** 0294.385.5555'
                ]
            },
            'danh-gia': {
                'đánh giá': [
                    '⭐ **Viết đánh giá:**\n\n**Hướng dẫn:**\n1. Chọn địa điểm đã tham quan\n2. Đánh giá từ 1-5 sao\n3. Viết nhận xét chi tiết\n4. Đính kèm hình ảnh (nếu có)\n\n**Lưu ý:** Đánh giá chân thực giúp du khách khác có trải nghiệm tốt hơn!'
                ],
                'review': [
                    '📝 **Chia sẻ trải nghiệm:**\n\n**Mẹo viết review hay:**\n• Mô tả cảm nhận thực tế\n• Chia sẻ tips hữu ích\n• Đánh giá dịch vụ, cơ sở vật chất\n• Gợi ý thời điểm tham quan tốt nhất'
                ]
            }
        };

        const currentPageResponses = responses[this.currentPage];
        if (!currentPageResponses) return [];

        for (const [key, responseArray] of Object.entries(currentPageResponses)) {
            if (message.includes(key)) {
                return responseArray;
            }
        }

        return [];
    }

    getGeneralResponses(message) {
        const responses = {
            'địa điểm': [
                '🏛️ Trà Vinh có nhiều địa điểm tuyệt vời như Chùa Ang, Ao Bà Om, Chùa Hang, Bảo tàng Văn hóa Khmer. Bạn muốn biết thêm về địa điểm nào?'
            ],
            'ẩm thực': [
                '🍜 Ẩm thực Trà Vinh rất đặc sắc với bánh tét lá cẩm, cháo cá linh bông điên điển, bánh xèo miền Tây, cà ri gà Khmer.'
            ],
            'default': [
                '🤖 Xin chào! Tôi là trợ lý AI du lịch Trà Vinh. Tôi có thể giúp bạn tìm hiểu về địa điểm, ẩm thực, lịch trình và nhiều thông tin khác.'
            ]
        };

        for (const [key, responseArray] of Object.entries(responses)) {
            if (key !== 'default' && message.includes(key)) {
                return responseArray;
            }
        }

        return responses.default;
    }

    // Utility methods
    handleInputChange() {
        const input = document.getElementById('chatbotInput');
        this.updateSendButton();

        // Show suggestions if enabled
        if (input.value.length > 2) {
            this.showInputSuggestions(input.value);
        } else {
            this.hideInputSuggestions();
        }
    }

    updateSendButton() {
        const input = document.getElementById('chatbotInput');
        const button = document.getElementById('sendButton');
        button.disabled = input.value.trim() === '';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showWelcomeMessage() {
        setTimeout(() => {
            if (!this.isOpen) {
                const badge = document.getElementById('notificationBadge');
                badge.style.display = 'flex';
            }
        }, 3000);
    }

    // Storage methods
    saveMessageHistory() {
        try {
            localStorage.setItem('chatbot_messages', JSON.stringify(this.messages.slice(-20)));
        } catch (e) {
            console.warn('Could not save message history:', e);
        }
    }

    loadMessageHistory() {
        try {
            const saved = localStorage.getItem('chatbot_messages');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Could not load message history:', e);
            return [];
        }
    }

    // Analytics
    trackEvent(eventName, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter: data,
                page: this.currentPage
            });
        }

        console.log('Chatbot Event:', eventName, data);
    }

    // Event handlers
    handleKeyboardShortcuts(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.closeChatbot();
        }
    }

    handleOutsideClick(e) {
        const chatbotComponent = document.getElementById('chatbotComponent');
        if (!chatbotComponent.contains(e.target) && this.isOpen) {
            // Don't close immediately, add delay
            setTimeout(() => {
                if (!chatbotComponent.matches(':hover')) {
                    // Uncomment to enable click-outside-to-close
                    // this.closeChatbot();
                }
            }, 100);
        }
    }

    handleWindowResize() {
        // Adjust chatbot position on mobile
        const window = document.getElementById('chatbotWindow');
        if (window.classList.contains('active')) {
            // Recalculate position if needed
        }
    }

    // Public API methods
    show() {
        if (!this.isOpen) {
            this.toggleChatbot();
        }
    }

    hide() {
        if (this.isOpen) {
            this.closeChatbot();
        }
    }

    sendProgrammaticMessage(message) {
        this.addMessage(message, 'ai');
    }

    clearHistory() {
        this.messages = [];
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        this.saveMessageHistory();
    }
}

// Global instance
window.ChatbotComponent = ChatbotComponent;
}
