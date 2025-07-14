/**
 * Gemini AI Configuration
 * Cấu hình kết nối với Gemini 2.0 API sử dụng Environment Variables
 */

// Load environment variables
function loadGeminiConfig() {
    // Đảm bảo envLoader đã được khởi tạo
    if (typeof window.envLoader === 'undefined') {
        console.warn('⚠️ EnvLoader not found, using default config');
        return getDefaultConfig();
    }

    return {
        // API key từ environment hoặc localStorage
        API_KEY: window.envLoader.get('GEMINI_API_KEY'),
        BASE_URL: window.envLoader.get('GEMINI_BASE_URL'),
        MODEL: window.envLoader.get('GEMINI_MODEL'),

        // Cấu hình request
        MAX_TOKENS: parseInt(window.envLoader.get('GEMINI_MAX_TOKENS')),
        TEMPERATURE: parseFloat(window.envLoader.get('GEMINI_TEMPERATURE')),
        TOP_P: parseFloat(window.envLoader.get('GEMINI_TOP_P')),
        TOP_K: parseInt(window.envLoader.get('GEMINI_TOP_K')),

        // Timeout và retry
        TIMEOUT: parseInt(window.envLoader.get('GEMINI_TIMEOUT')),
        MAX_RETRIES: parseInt(window.envLoader.get('GEMINI_MAX_RETRIES')),
        RETRY_DELAY: parseInt(window.envLoader.get('GEMINI_RETRY_DELAY'))
    };
}

// Default configuration fallback - Optimized for speed and accuracy
function getDefaultConfig() {
    return {
        API_KEY: 'YOUR_ACTUAL_GEMINI_API_KEY',
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        MODEL: 'gemini-2.0-flash',

        // Optimized for faster response
        MAX_TOKENS: 800,        // Reduced for faster response
        TEMPERATURE: 0.3,       // Lower for more focused answers
        TOP_P: 0.9,            // Higher for better quality
        TOP_K: 20,             // Lower for more focused selection

        // Optimized timeouts
        TIMEOUT: 15000,        // Reduced to 15 seconds
        MAX_RETRIES: 2,        // Reduced retries for faster failure
        RETRY_DELAY: 500       // Faster retry
    };
}

// Cấu hình API - load động từ environment
const GEMINI_CONFIG = loadGeminiConfig();

// System prompt cho từng trang - Optimized for accuracy and speed
const SYSTEM_PROMPTS = {
    'index': `Bạn là chuyên gia du lịch Trà Vinh với 10 năm kinh nghiệm. Trả lời NGẮN GỌN (tối đa 150 từ), CHÍNH XÁC và THỰC TẾ về:

🏛️ ĐỊA ĐIỂM CHÍNH:
- Chùa Ang (kiến trúc Khmer cổ)
- Ao Bà Om (hồ thiêng)
- Chùa Hang (trong hang động)
- Bảo tàng Khmer
- Cù lao Tân Quy

🍜 ẨM THỰC:
- Bánh tét lá cẩm
- Cháo cá linh bông điên điển
- Bánh xèo miền Tây
- Cà ri gà Khmer

📍 THÔNG TIN THỰC TẾ:
- Cách TP.HCM: 200km (4h xe)
- Thời gian tốt nhất: tháng 11-4
- Chi phí: 500k-1.5tr/người/ngày

Luôn đưa ra lời khuyên CỤ THỂ, GIÁ CẢ THỰC TẾ và THỜI GIAN DI CHUYỂN.`,

    'dia-diem': `Chuyên gia địa điểm Trà Vinh. Trả lời NGẮN GỌN (100 từ) với thông tin CHÍNH XÁC:

🏛️ TOP CHÙA KHMER:
- Chùa Ang: 5km từ TT, vé 0đ, mở 5h-18h
- Chùa Hang: 8km, trong hang tự nhiên
- Chùa Cò: có đàn cò trắng, đẹp nhất 16-18h

🌿 SINH THÁI:
- Ao Bà Om: 7km, vé 10k, thuê thúng chai 50k
- Cù lao Tân Quy: 15km, tour 200k/người
- Rừng tràm Trà Sư: 30km, vé 30k

⏰ THỜI GIAN THAM QUAN:
- Mỗi chùa: 45-60 phút
- Ao Bà Om: 2-3 giờ
- Cù lao: cả ngày

Luôn đưa ra GIÁ VÉ, KHOẢNG CÁCH và THỜI GIAN cụ thể.`,

    'gioi-thieu': `Bạn là chuyên gia lịch sử và văn hóa Trà Vinh.
Hãy chia sẻ kiến thức về:
- Lịch sử hình thành Trà Vinh
- Văn hóa người Khmer
- Lễ hội truyền thống
- Kiến trúc chùa Khmer
- Đặc sản và ẩm thực
Trả lời có chiều sâu, giáo dục và thú vị.`,

    'lien-he': `Bạn là nhân viên tư vấn du lịch Trà Vinh.
Hãy hỗ trợ về:
- Thông tin liên hệ và đặt tour
- Tư vấn gói du lịch
- Hỗ trợ khách hàng
- Giải đáp thắc mắc
- Xử lý khiếu nại và góp ý
Trả lời chuyên nghiệp, nhiệt tình và giải quyết vấn đề.`,

    'danh-gia': `Bạn là chuyên gia về review và đánh giá du lịch.
Hãy hướng dẫn về:
- Cách viết đánh giá chất lượng
- Chia sẻ trải nghiệm du lịch
- Tips chụp ảnh và viết blog
- Phân tích review từ du khách khác
- Gợi ý cải thiện trải nghiệm
Trả lời sáng tạo, thực tế và truyền cảm hứng.`
};

// Detect current page
function getCurrentPageType() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '') || 'index';
    return filename;
}

// Get system prompt for current page
function getSystemPrompt() {
    const pageType = getCurrentPageType();
    return SYSTEM_PROMPTS[pageType] || SYSTEM_PROMPTS['index'];
}

// Function để cập nhật API key động
function updateGeminiApiKey(newApiKey) {
    if (typeof window.envLoader !== 'undefined') {
        const success = window.envLoader.updateApiKey(newApiKey);
        if (success) {
            // Reload config
            Object.assign(GEMINI_CONFIG, loadGeminiConfig());
            console.log('🔄 Gemini config reloaded with new API key');
            return true;
        }
    }
    return false;
}

// Function để kiểm tra API key
function isGeminiApiKeyValid() {
    if (typeof window.envLoader !== 'undefined') {
        return window.envLoader.isApiKeyValid();
    }

    const apiKey = GEMINI_CONFIG.API_KEY;
    return apiKey &&
           apiKey !== 'YOUR_ACTUAL_GEMINI_API_KEY' &&
           apiKey.startsWith('AIzaSy') &&
           apiKey.length >= 35;
}

// Function để reload config
function reloadGeminiConfig() {
    Object.assign(GEMINI_CONFIG, loadGeminiConfig());
    console.log('🔄 Gemini configuration reloaded');
}

// Export configuration
window.GEMINI_CONFIG = GEMINI_CONFIG;
window.getSystemPrompt = getSystemPrompt;
window.getCurrentPageType = getCurrentPageType;
window.updateGeminiApiKey = updateGeminiApiKey;
window.isGeminiApiKeyValid = isGeminiApiKeyValid;
window.reloadGeminiConfig = reloadGeminiConfig;
