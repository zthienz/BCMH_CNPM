/**
 * Chatbot Component Loader
 * Automatically loads and initializes the chatbot component
 */

(function() {
    'use strict';

    // Configuration for different pages
    const PAGE_CONFIGS = {
        'index': {
            theme: 'default',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'dia-diem': {
            theme: 'tourism',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'check-db-images': {
            theme: 'admin',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        },
        'test-images': {
            theme: 'test',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        },
        'demo-animations': {
            theme: 'demo',
            autoShow: true,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'status': {
            theme: 'system',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        },
        'gioi-thieu': {
            theme: 'info',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'lien-he': {
            theme: 'contact',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'danh-gia': {
            theme: 'review',
            autoShow: false,
            showWelcome: true,
            enableNotifications: true,
            position: 'bottom-right'
        },
        'admin-db': {
            theme: 'admin',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        },
        'admin-images': {
            theme: 'admin',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        },
        'check-images': {
            theme: 'test',
            autoShow: false,
            showWelcome: false,
            enableNotifications: false,
            position: 'bottom-right'
        }
    };

    // Detect current page
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '') || 'index';
        return filename;
    }

    // Load CSS dynamically
    function loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    // Load JavaScript dynamically
    function loadJS(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Check if Font Awesome is loaded
    function ensureFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // Initialize chatbot
    function initializeChatbot() {
        const currentPage = getCurrentPage();
        const config = PAGE_CONFIGS[currentPage] || PAGE_CONFIGS['index'];

        // Create chatbot instance
        window.chatbotInstance = new ChatbotComponent(config);

        // Add to global scope for debugging
        window.chatbot = window.chatbotInstance;

        // Dispatch custom event
        const event = new CustomEvent('chatbotLoaded', {
            detail: {
                instance: window.chatbotInstance,
                page: currentPage,
                config: config
            }
        });
        document.dispatchEvent(event);

        console.log('🤖 Chatbot loaded successfully for page:', currentPage);
    }

    // Main loader function
    async function loadChatbot() {
        try {
            // Ensure Font Awesome is loaded
            ensureFontAwesome();

            // Determine base path for components
            const basePath = './components/';
            
            // Load CSS first
            await loadCSS(basePath + 'chatbot-styles.css');
            
            // Load JavaScript component
            await loadJS(basePath + 'chatbot-component.js');
            
            // Wait a bit for everything to be ready
            setTimeout(initializeChatbot, 100);
            
        } catch (error) {
            console.error('Failed to load chatbot component:', error);
            
            // Fallback: try to load from current directory
            try {
                await loadCSS('chatbot-styles.css');
                await loadJS('chatbot-component.js');
                setTimeout(initializeChatbot, 100);
            } catch (fallbackError) {
                console.error('Fallback loading also failed:', fallbackError);
            }
        }
    }

    // Auto-load when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadChatbot);
    } else {
        loadChatbot();
    }

    // Expose loader API
    window.ChatbotLoader = {
        load: loadChatbot,
        getCurrentPage: getCurrentPage,
        getPageConfig: (page) => PAGE_CONFIGS[page] || PAGE_CONFIGS['index']
    };

})();
