/**
 * JWT Service - Quản lý JWT token và auto logout
 */

class JWTService {
    constructor() {
        this.token = null;
        this.refreshToken = null;
        this.lastActivity = Date.now();
        this.inactivityTimeout = 60 * 1000; // 1 phút = 60 giây
        this.checkInterval = 5 * 1000; // Kiểm tra mỗi 5 giây
        this.intervalId = null;
        this.isLoggedIn = false;
        
        this.init();
    }

    /**
     * Khởi tạo service
     */
    init() {
        // Load token từ localStorage
        this.loadTokens();
        
        // Thiết lập event listeners cho activity tracking
        this.setupActivityTracking();
        
        // Bắt đầu kiểm tra inactivity
        this.startInactivityCheck();
        
        console.log('🔐 JWT Service initialized');
    }

    /**
     * Tạo JWT token giả lập (trong thực tế sẽ nhận từ server)
     */
    generateToken(userData) {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const payload = {
            sub: userData.id || userData.MaTK,
            username: userData.username || userData.TenNguoiDung,
            email: userData.email || userData.Email,
            role: userData.role || userData.LoaiNguoiDung || 'user',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 giờ
        };

        // Mã hóa base64 (giả lập - trong thực tế dùng thư viện JWT)
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Tạo refresh token
     */
    generateRefreshToken() {
        return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
    }

    /**
     * Đăng nhập và tạo token
     */
    login(userData) {
        this.token = this.generateToken(userData);
        this.refreshToken = this.generateRefreshToken();
        this.isLoggedIn = true;
        this.lastActivity = Date.now();

        // Lưu vào localStorage
        this.saveTokens();

        // Bắt đầu theo dõi hoạt động
        this.startInactivityCheck();

        console.log('✅ User logged in with JWT');
        return {
            token: this.token,
            refreshToken: this.refreshToken,
            user: this.decodeToken(this.token)
        };
    }

    /**
     * Đăng xuất
     */
    logout(reason = 'manual') {
        this.token = null;
        this.refreshToken = null;
        this.isLoggedIn = false;
        
        // Xóa khỏi localStorage
        this.clearTokens();
        
        // Dừng kiểm tra inactivity
        this.stopInactivityCheck();

        // Hiển thị thông báo tùy theo lý do
        if (reason === 'inactivity') {
            this.showInactivityLogoutModal();
        }

        // Trigger logout event
        window.dispatchEvent(new CustomEvent('userLogout', { 
            detail: { reason } 
        }));

        console.log(`🚪 User logged out (${reason})`);
    }

    /**
     * Kiểm tra token có hợp lệ không
     */
    isValidToken() {
        if (!this.token) return false;

        try {
            const payload = this.decodeToken(this.token);
            const now = Math.floor(Date.now() / 1000);
            
            return payload.exp > now;
        } catch (error) {
            console.error('Invalid token:', error);
            return false;
        }
    }

    /**
     * Giải mã token
     */
    decodeToken(token) {
        if (!token) return null;

        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    /**
     * Lấy thông tin user từ token
     */
    getCurrentUser() {
        if (!this.isValidToken()) return null;
        return this.decodeToken(this.token);
    }

    /**
     * Thiết lập theo dõi hoạt động của user
     */
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isLoggedIn) {
                    this.updateLastActivity();
                }
            }, true);
        });
    }

    /**
     * Cập nhật thời gian hoạt động cuối
     */
    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    /**
     * Bắt đầu kiểm tra inactivity
     */
    startInactivityCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            if (this.isLoggedIn) {
                const timeSinceLastActivity = Date.now() - this.lastActivity;
                
                if (timeSinceLastActivity >= this.inactivityTimeout) {
                    this.logout('inactivity');
                }
            }
        }, this.checkInterval);
    }

    /**
     * Dừng kiểm tra inactivity
     */
    stopInactivityCheck() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Hiển thị modal thông báo đăng xuất do không hoạt động
     */
    showInactivityLogoutModal() {
        // Tạo modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <i class="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Tự động đăng xuất</h3>
                    <p class="text-sm text-gray-500 mb-4">
                        Bạn đã không tương tác trong 1 phút nên hệ thống tự động đăng xuất để bảo mật tài khoản.
                    </p>
                    <button id="inactivity-ok-btn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
                        Đã hiểu
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Xử lý click OK
        document.getElementById('inactivity-ok-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            // Redirect về trang chủ hoặc trang login
            window.location.href = 'index.html';
        });

        // Auto close sau 10 giây
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
                window.location.href = 'index.html';
            }
        }, 10000);
    }

    /**
     * Lưu tokens vào localStorage
     */
    saveTokens() {
        if (this.token) {
            localStorage.setItem('jwt_token', this.token);
        }
        if (this.refreshToken) {
            localStorage.setItem('refresh_token', this.refreshToken);
        }
        localStorage.setItem('last_activity', this.lastActivity.toString());
    }

    /**
     * Load tokens từ localStorage
     */
    loadTokens() {
        this.token = localStorage.getItem('jwt_token');
        this.refreshToken = localStorage.getItem('refresh_token');
        const lastActivity = localStorage.getItem('last_activity');
        
        if (lastActivity) {
            this.lastActivity = parseInt(lastActivity);
        }

        // Kiểm tra token có hợp lệ và chưa hết hạn không
        if (this.token && this.isValidToken()) {
            // Kiểm tra có quá thời gian inactivity không
            const timeSinceLastActivity = Date.now() - this.lastActivity;
            if (timeSinceLastActivity < this.inactivityTimeout) {
                this.isLoggedIn = true;
                this.startInactivityCheck();
            } else {
                this.clearTokens();
            }
        } else {
            this.clearTokens();
        }
    }

    /**
     * Xóa tokens khỏi localStorage
     */
    clearTokens() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('last_activity');
    }

    /**
     * Lấy token để gửi request
     */
    getAuthHeader() {
        if (this.token && this.isValidToken()) {
            return {
                'Authorization': `Bearer ${this.token}`
            };
        }
        return {};
    }

    /**
     * Refresh token (giả lập)
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Tạo token mới
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            this.token = this.generateToken(currentUser);
            this.saveTokens();
            return this.token;
        }

        throw new Error('Failed to refresh token');
    }
}

// Export global instance
window.jwtService = new JWTService();

// Export class for manual initialization
window.JWTService = JWTService;
