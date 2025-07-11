/**
 * Gemini AI Configuration
 * Cấu hình kết nối với Gemini 2.0 API
 */

// Cấu hình API
const GEMINI_CONFIG = {
    // API key thực từ Google AI Studio
    API_KEY: 'AIzaSyBqkGL6BqSyQi-rrJeOc8p-L1YwIv6Mb4s', // API key đã được cấu hình
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    MODEL: 'gemini-2.0-flash',
    
    // Cấu hình request
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    TOP_P: 0.8,
    TOP_K: 40,
    
    // Timeout và retry
    TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 second
};

// System prompt cho từng trang
const SYSTEM_PROMPTS = {
    'index': `Bạn là trợ lý AI du lịch chuyên về Trà Vinh, Việt Nam. 
Hãy trả lời ngắn gọn, thân thiện và hữu ích về:
- Thông tin tổng quan về Trà Vinh
- Địa điểm du lịch nổi tiếng
- Ẩm thực đặc sản
- Lập kế hoạch du lịch
- Văn hóa Khmer
Luôn sử dụng emoji phù hợp và format markdown đơn giản.`,

    'dia-diem': `Bạn là chuyên gia địa điểm du lịch Trà Vinh. 
Hãy hỗ trợ về:
- Tìm kiếm và gợi ý địa điểm
- Thông tin chi tiết các chùa Khmer
- Lịch trình tham quan
- Đánh giá và review địa điểm
- Cách di chuyển và thời gian tham quan
Trả lời cụ thể, thực tế và có thể hành động được.`,

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

// Export configuration
window.GEMINI_CONFIG = GEMINI_CONFIG;
window.getSystemPrompt = getSystemPrompt;
window.getCurrentPageType = getCurrentPageType;
