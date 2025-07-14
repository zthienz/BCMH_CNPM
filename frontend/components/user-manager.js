/**
 * User Management Component
 * Handles user session, UI updates, and authentication state
 */

class UserManager {
    constructor() {
        this.user = null;
        this.isLoggedIn = false;
        
        this.init();
    }

    /**
     * Initialize user manager
     */
    init() {
        this.checkSession();
        this.bindEvents();
        this.updateUI();
        
        console.log('👤 User Manager initialized');
    }

    /**
     * Check user session on page load
     */
    async checkSession() {
        try {
            // Check localStorage first
            const localSession = this.getLocalSession();
            if (localSession) {
                this.user = localSession;
                this.isLoggedIn = true;
            }

            // Verify with server
            const response = await fetch('http://localhost:3000/api/auth/session', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success && result.data && result.data.logged_in) {
                this.user = result.data.user;
                this.isLoggedIn = true;
                this.setLocalSession(result.data.user);
            } else {
                this.user = null;
                this.isLoggedIn = false;
                this.clearLocalSession();
            }

            this.updateUI();

        } catch (error) {
            console.error('Session check error:', error);
            // Use local session as fallback
            const localSession = this.getLocalSession();
            if (localSession) {
                this.user = localSession;
                this.isLoggedIn = true;
            }
            this.updateUI();
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Listen for login/logout events
        window.addEventListener('userLoggedIn', (e) => {
            this.user = e.detail.user;
            this.isLoggedIn = true;
            this.setLocalSession(e.detail.user);
            this.updateUI();
        });

        window.addEventListener('userLoggedOut', () => {
            this.user = null;
            this.isLoggedIn = false;
            this.clearLocalSession();
            this.updateUI();
        });
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        if (this.isLoggedIn && this.user) {
            this.showLoggedInUI();
        } else {
            this.showLoggedOutUI();
        }
    }

    /**
     * Show UI for logged in user
     */
    showLoggedInUI() {
        // Update navigation buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="flex items-center space-x-4">
                    <!-- Desktop user menu -->
                    <div class="hidden md:flex items-center space-x-3">
                        <div class="relative">
                            <button id="userMenuButton" class="flex items-center space-x-2 text-white hover:text-yellow-200 px-3 py-2 rounded-lg transition duration-300 focus:outline-none">
                                <i class="fas fa-user-circle text-xl"></i>
                                <span class="font-medium">${this.escapeHtml(this.user.name)}</span>
                                <i class="fas fa-chevron-down ml-1 transition-transform duration-200" id="userMenuChevron"></i>
                            </button>
                            <div id="userDropdownMenu" class="user-dropdown absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible transform scale-95 user-menu-transition z-50">
                                <div class="py-2">
                                    <!-- User Info Header -->
                                    <div class="px-4 py-3 border-b border-gray-100">
                                        <div class="flex items-center space-x-3">
                                            <div class="user-avatar w-10 h-10 rounded-full flex items-center justify-center">
                                                <i class="fas fa-user text-white"></i>
                                            </div>
                                            <div>
                                                <div class="font-semibold text-gray-900">${this.escapeHtml(this.user.name)}</div>
                                                <div class="text-sm text-gray-500">${this.escapeHtml(this.user.email)}</div>
                                                <div class="text-xs text-gray-400">${this.user.type}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Menu Items -->
                                    <a href="#" onclick="showUserProfile(); closeUserMenu();" class="user-menu-item flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 user-menu-transition">
                                        <i class="fas fa-user mr-3 text-gray-400"></i>
                                        <span>Thông tin cá nhân</span>
                                    </a>
                                    <a href="#" onclick="showUserFavorites(); closeUserMenu();" class="user-menu-item flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 user-menu-transition">
                                        <i class="fas fa-heart mr-3 text-gray-400"></i>
                                        <span>Địa điểm yêu thích</span>
                                    </a>
                                    <a href="#" onclick="showUserReviews(); closeUserMenu();" class="user-menu-item flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 user-menu-transition">
                                        <i class="fas fa-star mr-3 text-gray-400"></i>
                                        <span>Đánh giá của tôi</span>
                                    </a>
                                    <a href="#" onclick="showUserSettings(); closeUserMenu();" class="user-menu-item flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 user-menu-transition">
                                        <i class="fas fa-cog mr-3 text-gray-400"></i>
                                        <span>Cài đặt</span>
                                    </a>

                                    <!-- Divider -->
                                    <hr class="my-2">

                                    <!-- Logout -->
                                    <a href="#" onclick="window.userManager.logout(); closeUserMenu();" class="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition duration-200">
                                        <i class="fas fa-sign-out-alt mr-3"></i>
                                        <span class="font-medium">Đăng xuất</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile user menu -->
                    <div class="md:hidden">
                        <button id="mobileUserButton" class="flex items-center space-x-2 text-white hover:text-yellow-200 px-3 py-2 rounded-lg transition duration-300">
                            <i class="fas fa-user-circle text-xl"></i>
                            <span class="font-medium">${this.escapeHtml(this.user.name)}</span>
                        </button>
                    </div>
                </div>
            `;

            // Setup dropdown functionality
            this.setupUserDropdown();
        }

        // Show welcome message (optional)
        this.showWelcomeMessage();
    }

    /**
     * Show UI for logged out user
     */
    showLoggedOutUI() {
        // Update navigation buttons
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <div class="flex items-center space-x-4">
                    <button onclick="window.authModal.openLogin()" class="bg-white text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition duration-300">
                        <i class="fas fa-sign-in-alt mr-2"></i>Đăng nhập
                    </button>
                    <button onclick="window.authModal.openRegister()" class="border border-white text-white px-4 py-2 rounded-full hover:bg-white hover:text-blue-600 transition duration-300">
                        <i class="fas fa-user-plus mr-2"></i>Đăng ký
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show welcome message for new login
     */
    showWelcomeMessage() {
        // Only show if recently logged in (within last 5 seconds)
        const loginTime = this.user.login_time;
        const now = Date.now() / 1000;
        
        if (loginTime && (now - loginTime) < 5) {
            this.showNotification(`Chào mừng ${this.user.name}!`, 'success');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        
        // Set color based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span>${this.escapeHtml(message)}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    /**
     * Logout user
     */
    async logout() {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            try {
                await window.authModal.logout();
            } catch (error) {
                console.error('Logout error:', error);
                this.showNotification('Có lỗi xảy ra khi đăng xuất', 'error');
            }
        }
    }

    /**
     * Setup user dropdown menu functionality
     */
    setupUserDropdown() {
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const userMenuChevron = document.getElementById('userMenuChevron');
        const mobileUserButton = document.getElementById('mobileUserButton');

        if (userMenuButton && userDropdownMenu) {
            // Toggle dropdown on button click
            userMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleUserDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                    this.closeUserDropdown();
                }
            });

            // Close dropdown on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeUserDropdown();
                }
            });
        }

        // Mobile user menu
        if (mobileUserButton) {
            mobileUserButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMobileUserMenu();
            });
        }
    }

    /**
     * Toggle user dropdown menu
     */
    toggleUserDropdown() {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const userMenuChevron = document.getElementById('userMenuChevron');

        if (userDropdownMenu && userMenuChevron) {
            const isVisible = !userDropdownMenu.classList.contains('opacity-0');

            if (isVisible) {
                this.closeUserDropdown();
            } else {
                this.openUserDropdown();
            }
        }
    }

    /**
     * Open user dropdown menu
     */
    openUserDropdown() {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const userMenuChevron = document.getElementById('userMenuChevron');

        if (userDropdownMenu && userMenuChevron) {
            userDropdownMenu.classList.remove('opacity-0', 'invisible', 'scale-95');
            userDropdownMenu.classList.add('opacity-100', 'visible', 'scale-100');
            userMenuChevron.classList.add('rotate-180');
        }
    }

    /**
     * Close user dropdown menu
     */
    closeUserDropdown() {
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        const userMenuChevron = document.getElementById('userMenuChevron');

        if (userDropdownMenu && userMenuChevron) {
            userDropdownMenu.classList.remove('opacity-100', 'visible', 'scale-100');
            userDropdownMenu.classList.add('opacity-0', 'invisible', 'scale-95');
            userMenuChevron.classList.remove('rotate-180');
        }
    }

    /**
     * Show mobile user menu
     */
    showMobileUserMenu() {
        const mobileMenuHTML = `
            <div id="mobileUserModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
                <div class="bg-white w-full max-w-md rounded-t-2xl p-6 transform translate-y-0 transition-transform duration-300">
                    <!-- User Info -->
                    <div class="flex items-center space-x-3 mb-6">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-blue-600 text-xl"></i>
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">${this.escapeHtml(this.user.name)}</div>
                            <div class="text-sm text-gray-500">${this.escapeHtml(this.user.email)}</div>
                            <div class="text-xs text-gray-400">${this.user.type}</div>
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="space-y-2">
                        <a href="#" onclick="showUserProfile(); closeMobileUserMenu();" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
                            <i class="fas fa-user mr-3 text-gray-400"></i>
                            <span>Thông tin cá nhân</span>
                        </a>
                        <a href="#" onclick="showUserFavorites(); closeMobileUserMenu();" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
                            <i class="fas fa-heart mr-3 text-gray-400"></i>
                            <span>Địa điểm yêu thích</span>
                        </a>
                        <a href="#" onclick="showUserReviews(); closeMobileUserMenu();" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
                            <i class="fas fa-star mr-3 text-gray-400"></i>
                            <span>Đánh giá của tôi</span>
                        </a>
                        <a href="#" onclick="showUserSettings(); closeMobileUserMenu();" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200">
                            <i class="fas fa-cog mr-3 text-gray-400"></i>
                            <span>Cài đặt</span>
                        </a>

                        <!-- Logout -->
                        <a href="#" onclick="window.userManager.logout(); closeMobileUserMenu();" class="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 mt-4 border-t pt-4">
                            <i class="fas fa-sign-out-alt mr-3"></i>
                            <span class="font-medium">Đăng xuất</span>
                        </a>
                    </div>

                    <!-- Close Button -->
                    <button onclick="closeMobileUserMenu()" class="w-full mt-6 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200">
                        <i class="fas fa-times mr-2"></i>
                        Đóng
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);

        // Add click outside to close
        const modal = document.getElementById('mobileUserModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeMobileUserMenu();
                }
            });
        }
    }

    /**
     * Close mobile user menu
     */
    closeMobileUserMenu() {
        const modal = document.getElementById('mobileUserModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Get local session
     */
    getLocalSession() {
        try {
            const session = localStorage.getItem('user_session');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error getting local session:', error);
            return null;
        }
    }

    /**
     * Set local session
     */
    setLocalSession(user) {
        try {
            localStorage.setItem('user_session', JSON.stringify(user));
        } catch (error) {
            console.error('Error setting local session:', error);
        }
    }

    /**
     * Clear local session
     */
    clearLocalSession() {
        localStorage.removeItem('user_session');
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
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Check if user is logged in
     */
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

// Global functions for HTML onclick events
function showUserProfile() {
    alert('Tính năng thông tin cá nhân đang được phát triển');
}

function showUserFavorites() {
    alert('Tính năng yêu thích đang được phát triển');
}

function showUserReviews() {
    alert('Tính năng đánh giá đang được phát triển');
}

function toggleMobileUserMenu() {
    alert('Mobile user menu đang được phát triển');
}

// Global helper functions for menu actions
window.closeUserMenu = function() {
    if (window.userManager) {
        window.userManager.closeUserDropdown();
    }
};

window.closeMobileUserMenu = function() {
    if (window.userManager) {
        window.userManager.closeMobileUserMenu();
    }
};

window.showUserProfile = function() {
    alert('Tính năng thông tin cá nhân đang được phát triển!');
};

window.showUserFavorites = function() {
    alert('Tính năng địa điểm yêu thích đang được phát triển!');
};

window.showUserReviews = function() {
    alert('Tính năng đánh giá đang được phát triển!');
};

window.showUserSettings = function() {
    alert('Tính năng cài đặt đang được phát triển!');
};

// Create global instance
window.userManager = new UserManager();

// Export class
window.UserManager = UserManager;

console.log('👤 User Manager component loaded');
