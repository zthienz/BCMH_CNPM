/**
 * Authentication Modal Component
 * Handles login and registration modals with beautiful UI
 */

class AuthModal {
    constructor() {
        this.isOpen = false;
        this.currentMode = 'login'; // 'login' or 'register'
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the modal
     */
    init() {
        this.createStyles();
        this.createHTML();
        this.bindEvents();
        
        console.log('🔐 Auth Modal initialized');
    }

    /**
     * Create CSS styles
     */
    createStyles() {
        if (document.getElementById('auth-modal-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'auth-modal-styles';
        style.textContent = `
            .auth-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .auth-modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .auth-modal {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                width: 100%;
                max-width: 400px;
                margin: 20px;
                transform: translateY(20px) scale(0.95);
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .auth-modal-overlay.active .auth-modal {
                transform: translateY(0) scale(1);
            }

            .auth-modal-header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 24px;
                text-align: center;
                position: relative;
            }

            .auth-modal-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: background-color 0.2s;
            }

            .auth-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .auth-modal-title {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
            }

            .auth-modal-subtitle {
                font-size: 14px;
                opacity: 0.9;
                margin: 8px 0 0 0;
            }

            .auth-modal-body {
                padding: 32px 24px;
            }

            .auth-form-group {
                margin-bottom: 20px;
            }

            .auth-form-label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
                margin-bottom: 6px;
            }

            .auth-form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s;
                box-sizing: border-box;
            }

            .auth-form-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .auth-form-input.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }

            .auth-form-error {
                color: #ef4444;
                font-size: 12px;
                margin-top: 4px;
                display: none;
            }

            .auth-form-error.show {
                display: block;
            }

            .auth-submit-btn {
                width: 100%;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 16px;
                position: relative;
                overflow: hidden;
            }

            .auth-submit-btn:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
            }

            .auth-submit-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                transform: none;
            }

            .auth-submit-btn .loading-spinner {
                display: none;
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            }

            .auth-submit-btn.loading .loading-spinner {
                display: inline-block;
            }

            .auth-toggle {
                text-align: center;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
            }

            .auth-toggle-text {
                color: #6b7280;
                font-size: 14px;
            }

            .auth-toggle-link {
                color: #3b82f6;
                text-decoration: none;
                font-weight: 500;
                cursor: pointer;
                transition: color 0.2s;
            }

            .auth-toggle-link:hover {
                color: #1d4ed8;
                text-decoration: underline;
            }

            .auth-success-message {
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                color: #166534;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                display: none;
            }

            .auth-success-message.show {
                display: block;
            }

            .auth-error-message {
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                display: none;
            }

            .auth-error-message.show {
                display: block;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 480px) {
                .auth-modal {
                    margin: 10px;
                    max-width: none;
                }

                .auth-modal-body {
                    padding: 24px 20px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Create HTML structure
     */
    createHTML() {
        const modalHTML = `
            <div class="auth-modal-overlay" id="auth-modal-overlay">
                <div class="auth-modal">
                    <div class="auth-modal-header">
                        <button class="auth-modal-close" id="auth-modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                        <h2 class="auth-modal-title" id="auth-modal-title">Đăng nhập</h2>
                        <p class="auth-modal-subtitle" id="auth-modal-subtitle">Chào mừng bạn quay trở lại</p>
                    </div>
                    
                    <div class="auth-modal-body">
                        <div class="auth-success-message" id="auth-success-message"></div>
                        <div class="auth-error-message" id="auth-error-message"></div>
                        
                        <form id="auth-form">
                            <!-- Name field (only for register) -->
                            <div class="auth-form-group" id="name-group" style="display: none;">
                                <label class="auth-form-label" for="auth-name">Họ và tên</label>
                                <input type="text" class="auth-form-input" id="auth-name" placeholder="Nhập họ và tên">
                                <div class="auth-form-error" id="name-error"></div>
                            </div>
                            
                            <!-- Email field -->
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="auth-email">Email</label>
                                <input type="email" class="auth-form-input" id="auth-email" placeholder="Nhập email của bạn">
                                <div class="auth-form-error" id="email-error"></div>
                            </div>
                            
                            <!-- Password field -->
                            <div class="auth-form-group">
                                <label class="auth-form-label" for="auth-password">Mật khẩu</label>
                                <input type="password" class="auth-form-input" id="auth-password" placeholder="Nhập mật khẩu">
                                <div class="auth-form-error" id="password-error"></div>
                            </div>
                            
                            <!-- Confirm Password field (only for register) -->
                            <div class="auth-form-group" id="confirm-password-group" style="display: none;">
                                <label class="auth-form-label" for="auth-confirm-password">Xác nhận mật khẩu</label>
                                <input type="password" class="auth-form-input" id="auth-confirm-password" placeholder="Nhập lại mật khẩu">
                                <div class="auth-form-error" id="confirm-password-error"></div>
                            </div>
                            
                            <button type="submit" class="auth-submit-btn" id="auth-submit-btn">
                                <span class="loading-spinner"></span>
                                <span id="auth-submit-text">Đăng nhập</span>
                            </button>
                        </form>
                        
                        <div class="auth-toggle">
                            <p class="auth-toggle-text">
                                <span id="auth-toggle-question">Chưa có tài khoản?</span>
                                <a class="auth-toggle-link" id="auth-toggle-link">Đăng ký ngay</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close modal events
        document.getElementById('auth-modal-close').addEventListener('click', () => this.close());
        document.getElementById('auth-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal-overlay') {
                this.close();
            }
        });

        // Toggle between login/register
        document.getElementById('auth-toggle-link').addEventListener('click', () => this.toggleMode());

        // Form submission
        document.getElementById('auth-form').addEventListener('submit', (e) => this.handleSubmit(e));

        // Input validation
        ['auth-email', 'auth-password', 'auth-name', 'auth-confirm-password'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('blur', () => this.validateField(id));
                input.addEventListener('input', () => this.clearFieldError(id));
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Open modal in login mode
     */
    openLogin() {
        this.currentMode = 'login';
        this.updateUI();
        this.open();
    }

    /**
     * Open modal in register mode
     */
    openRegister() {
        this.currentMode = 'register';
        this.updateUI();
        this.open();
    }

    /**
     * Open modal
     */
    open() {
        this.isOpen = true;
        document.getElementById('auth-modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.currentMode === 'register' ? 
                document.getElementById('auth-name') : 
                document.getElementById('auth-email');
            firstInput.focus();
        }, 300);
    }

    /**
     * Close modal
     */
    close() {
        this.isOpen = false;
        document.getElementById('auth-modal-overlay').classList.remove('active');
        document.body.style.overflow = '';
        this.clearForm();
        this.clearMessages();
    }

    /**
     * Toggle between login and register modes
     */
    toggleMode() {
        this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
        this.updateUI();
        this.clearForm();
        this.clearMessages();
    }

    /**
     * Update UI based on current mode
     */
    updateUI() {
        const isRegister = this.currentMode === 'register';
        
        // Update title and subtitle
        document.getElementById('auth-modal-title').textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
        document.getElementById('auth-modal-subtitle').textContent = isRegister ? 
            'Tạo tài khoản mới để khám phá Trà Vinh' : 
            'Chào mừng bạn quay trở lại';
        
        // Show/hide fields
        document.getElementById('name-group').style.display = isRegister ? 'block' : 'none';
        document.getElementById('confirm-password-group').style.display = isRegister ? 'block' : 'none';
        
        // Update submit button
        document.getElementById('auth-submit-text').textContent = isRegister ? 'Đăng ký' : 'Đăng nhập';
        
        // Update toggle text
        document.getElementById('auth-toggle-question').textContent = isRegister ? 
            'Đã có tài khoản?' : 'Chưa có tài khoản?';
        document.getElementById('auth-toggle-link').textContent = isRegister ? 
            'Đăng nhập ngay' : 'Đăng ký ngay';
    }

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            const formData = this.getFormData();
            
            if (this.currentMode === 'login') {
                await this.handleLogin(formData);
            } else {
                await this.handleRegister(formData);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Get form data
     */
    getFormData() {
        const data = {
            email: document.getElementById('auth-email').value.trim(),
            password: document.getElementById('auth-password').value
        };
        
        if (this.currentMode === 'register') {
            data.name = document.getElementById('auth-name').value.trim();
            data.confirmPassword = document.getElementById('auth-confirm-password').value;
        }
        
        return data;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;
        
        // Validate email
        if (!this.validateField('auth-email')) isValid = false;
        
        // Validate password
        if (!this.validateField('auth-password')) isValid = false;
        
        if (this.currentMode === 'register') {
            // Validate name
            if (!this.validateField('auth-name')) isValid = false;
            
            // Validate confirm password
            if (!this.validateField('auth-confirm-password')) isValid = false;
        }
        
        return isValid;
    }

    /**
     * Validate individual field
     */
    validateField(fieldId) {
        const input = document.getElementById(fieldId);
        const value = input.value.trim();
        let errorMessage = '';
        
        switch (fieldId) {
            case 'auth-email':
                if (!value) {
                    errorMessage = 'Email không được để trống';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Email không hợp lệ';
                }
                break;
                
            case 'auth-password':
                if (!value) {
                    errorMessage = 'Mật khẩu không được để trống';
                } else if (value.length < 6) {
                    errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
                }
                break;
                
            case 'auth-name':
                if (!value) {
                    errorMessage = 'Họ và tên không được để trống';
                } else if (value.length < 2) {
                    errorMessage = 'Họ và tên phải có ít nhất 2 ký tự';
                }
                break;
                
            case 'auth-confirm-password':
                const password = document.getElementById('auth-password').value;
                if (!value) {
                    errorMessage = 'Vui lòng xác nhận mật khẩu';
                } else if (value !== password) {
                    errorMessage = 'Mật khẩu xác nhận không khớp';
                }
                break;
        }
        
        if (errorMessage) {
            this.showFieldError(fieldId, errorMessage);
            return false;
        } else {
            this.clearFieldError(fieldId);
            return true;
        }
    }

    /**
     * Show field error
     */
    showFieldError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId.replace('auth-', '') + '-error');
        
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId.replace('auth-', '') + '-error');
        
        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        const submitBtn = document.getElementById('auth-submit-btn');
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successElement = document.getElementById('auth-success-message');
        successElement.textContent = message;
        successElement.classList.add('show');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorElement = document.getElementById('auth-error-message');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        document.getElementById('auth-success-message').classList.remove('show');
        document.getElementById('auth-error-message').classList.remove('show');
    }

    /**
     * Clear form
     */
    clearForm() {
        document.getElementById('auth-form').reset();
        
        // Clear all field errors
        ['auth-email', 'auth-password', 'auth-name', 'auth-confirm-password'].forEach(fieldId => {
            this.clearFieldError(fieldId);
        });
    }

    /**
     * Handle login with Node.js API
     */
    async handleLogin(data) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Đăng nhập thành công!');

                // Store user info
                this.setUserSession(result.data.user);

                // Update UI through userManager
                this.updateUIAfterLogin(result.data.user);

                setTimeout(() => {
                    this.close();
                }, 1000);
            } else {
                throw new Error(result.message || 'Đăng nhập thất bại');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server đã chạy chưa.');
            }
            throw new Error(error.message || 'Có lỗi xảy ra khi đăng nhập');
        }
    }

    /**
     * Handle registration with Node.js API
     */
    async handleRegister(data) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');

                setTimeout(() => {
                    this.currentMode = 'login';
                    this.updateUI();
                    this.clearForm();
                    this.clearMessages();

                    // Pre-fill email for convenience
                    document.getElementById('auth-email').value = data.email;
                }, 2000);
            } else {
                throw new Error(result.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server đã chạy chưa.');
            }
            throw new Error(error.message || 'Có lỗi xảy ra khi đăng ký');
        }
    }

    /**
     * Set user session in localStorage
     */
    setUserSession(user) {
        localStorage.setItem('user_session', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            login_time: user.login_time || Date.now()
        }));
    }

    /**
     * Get user session from localStorage
     */
    getUserSession() {
        try {
            const session = localStorage.getItem('user_session');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error getting user session:', error);
            return null;
        }
    }

    /**
     * Clear user session
     */
    clearUserSession() {
        localStorage.removeItem('user_session');
    }

    /**
     * Update UI after successful login
     */
    updateUIAfterLogin(user) {
        console.log('User logged in:', user);

        // Update userManager with user info
        if (window.userManager) {
            window.userManager.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                login_time: user.login_time || Date.now() / 1000
            };
            window.userManager.isLoggedIn = true;
            window.userManager.updateUI();

            console.log('✅ UserManager updated with user info:', window.userManager.user);
        } else {
            console.error('❌ UserManager not found');
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('userLoggedIn', {
            detail: { user: user }
        }));
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getUserSession() !== null;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Thêm JWT token vào header nếu có
            const headers = {
                'Content-Type': 'application/json',
            };

            if (window.jwtService) {
                Object.assign(headers, window.jwtService.getAuthHeader());
            }

            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: headers,
                credentials: 'include'
            });

            const result = await response.json();

            // Clear local session regardless of API response
            this.clearUserSession();

            // Logout từ JWT service
            if (window.jwtService && window.jwtService.isLoggedIn) {
                window.jwtService.logout('manual');
            }

            // Update userManager
            if (window.userManager) {
                window.userManager.user = null;
                window.userManager.isLoggedIn = false;
                window.userManager.updateUI();
                console.log('✅ UserManager updated after logout');
            }

            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('userLoggedOut', {
                detail: { reason: 'manual' }
            }));

        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local session on error
            this.clearUserSession();

            // Logout từ JWT service ngay cả khi có lỗi
            if (window.jwtService && window.jwtService.isLoggedIn) {
                window.jwtService.logout('manual');
            }

            // Update userManager even on error
            if (window.userManager) {
                window.userManager.user = null;
                window.userManager.isLoggedIn = false;
                window.userManager.updateUI();
            }

            // Dispatch logout event
            window.dispatchEvent(new CustomEvent('userLoggedOut', {
                detail: { reason: 'manual' }
            }));
        }
    }
}

// Create global instance
window.authModal = new AuthModal();

// Export class
window.AuthModal = AuthModal;

console.log('🔐 Auth Modal component loaded');
