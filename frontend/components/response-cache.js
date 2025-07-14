/**
 * Response Cache for Gemini Chatbot
 * Caches common responses to improve speed
 */

class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.ttl = 30 * 60 * 1000; // 30 minutes
        this.loadFromStorage();
        this.initCommonResponses();
    }

    /**
     * Load cache from localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('gemini_response_cache');
            if (stored) {
                const data = JSON.parse(stored);
                Object.entries(data).forEach(([key, value]) => {
                    if (Date.now() - value.timestamp < this.ttl) {
                        this.cache.set(key, value);
                    }
                });
                console.log(`📦 Loaded ${this.cache.size} cached responses`);
            }
        } catch (error) {
            console.error('Failed to load cache:', error);
        }
    }

    /**
     * Save cache to localStorage
     */
    saveToStorage() {
        try {
            const data = {};
            this.cache.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem('gemini_response_cache', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save cache:', error);
        }
    }

    /**
     * Initialize common responses for instant answers
     */
    initCommonResponses() {
        const commonResponses = {
            'xin chào': '👋 Xin chào! Tôi là trợ lý du lịch Trà Vinh. Tôi có thể giúp bạn tìm hiểu về địa điểm, ẩm thực và lập kế hoạch du lịch. Bạn muốn biết gì?',
            
            'hello': '👋 Hello! I\'m your Tra Vinh travel assistant. I can help you discover attractions, local cuisine, and plan your trip. What would you like to know?',
            
            'địa điểm nổi tiếng': '🏛️ **Top địa điểm Trà Vinh:**\n• Chùa Ang - kiến trúc Khmer cổ\n• Ao Bà Om - hồ thiêng linh\n• Chùa Hang - trong hang động\n• Cù lao Tân Quy - sinh thái\n• Bảo tàng Khmer\n\nBạn muốn biết chi tiết địa điểm nào?',
            
            'ẩm thực đặc sản': '🍜 **Đặc sản Trà Vinh:**\n• Bánh tét lá cẩm - 15k/cái\n• Cháo cá linh bông điên điển - 25k/tô\n• Bánh xèo miền Tây - 20k/cái\n• Cà ri gà Khmer - 45k/phần\n• Bánh ít lá gai - 5k/cái\n\nQuán nào ngon nhất? Hỏi tôi nhé!',
            
            'cách đi': '🚗 **Cách đến Trà Vinh:**\n• **Từ TP.HCM:** 200km, 4h lái xe\n• **Xe khách:** 80-120k, 4.5h\n• **Xe máy:** Đường tỉnh lộ 53\n• **Máy bay:** Bay Cần Thơ + xe 1.5h\n\nBạn đi từ đâu? Tôi tư vấn cụ thể hơn!',
            
            'chi phí': '💰 **Chi phí du lịch Trà Vinh:**\n• **1 ngày:** 500-800k/người\n• **2 ngày 1 đêm:** 1.2-1.8tr/người\n• **Khách sạn:** 300-800k/đêm\n• **Ăn uống:** 150-300k/ngày\n• **Di chuyển:** 200-400k/ngày\n\nBao gồm ăn, ở, tham quan!',
            
            'thời gian tốt nhất': '🌤️ **Thời gian lý tưởng:**\n• **Tháng 11-4:** Mùa khô, mát mẻ\n• **Tránh tháng 5-10:** Mùa mưa\n• **Lễ hội:** Ok Om Bok (tháng 10-11)\n• **Cuối tuần:** Đông khách hơn\n\nBạn dự định đi khi nào?',
            
            'lịch trình 1 ngày': '📅 **Lịch trình 1 ngày:**\n**Sáng (8-12h):**\n• Chùa Ang (1.5h)\n• Bảo tàng Khmer (1h)\n\n**Chiều (14-18h):**\n• Ao Bà Om (2h)\n• Chùa Hang (1h)\n\n**Tối:** Ăn đặc sản + dạo chợ đêm\n\nCần tư vấn chi tiết hơn không?',
            
            'lịch trình 2 ngày': '📅 **Lịch trình 2 ngày 1 đêm:**\n**Ngày 1:** Chùa Ang → Bảo tàng → Ao Bà Om\n**Ngày 2:** Cù lao Tân Quy → Chùa Hang → Chợ Trà Vinh\n\n**Nghỉ đêm:** Khách sạn TT (400-600k)\n**Ăn uống:** Thử hết đặc sản địa phương\n\nCần book tour không?'
        };

        Object.entries(commonResponses).forEach(([key, response]) => {
            this.set(key, response, true);
        });

        console.log(`🚀 Initialized ${Object.keys(commonResponses).length} instant responses`);
    }

    /**
     * Generate cache key from message
     */
    generateKey(message) {
        return message.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ');
    }

    /**
     * Check if response exists in cache
     */
    has(message) {
        const key = this.generateKey(message);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            return true;
        } else if (cached) {
            this.cache.delete(key);
        }
        
        return false;
    }

    /**
     * Get cached response
     */
    get(message) {
        const key = this.generateKey(message);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            console.log('⚡ Cache hit:', key);
            return cached.response;
        }
        
        return null;
    }

    /**
     * Set cached response
     */
    set(message, response, isCommon = false) {
        const key = this.generateKey(message);
        
        // Don't cache if cache is full and this isn't a common response
        if (this.cache.size >= this.maxSize && !isCommon) {
            this.evictOldest();
        }
        
        this.cache.set(key, {
            response: response,
            timestamp: Date.now(),
            isCommon: isCommon
        });
        
        if (!isCommon) {
            this.saveToStorage();
        }
    }

    /**
     * Evict oldest non-common entries
     */
    evictOldest() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        this.cache.forEach((value, key) => {
            if (!value.isCommon && value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        });
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Find similar cached responses
     */
    findSimilar(message) {
        const key = this.generateKey(message);
        const words = key.split(' ');
        
        for (const [cachedKey, cached] of this.cache.entries()) {
            if (Date.now() - cached.timestamp > this.ttl) continue;
            
            const similarity = this.calculateSimilarity(words, cachedKey.split(' '));
            if (similarity > 0.7) {
                console.log('🎯 Similar cache hit:', cachedKey, 'similarity:', similarity);
                return cached.response;
            }
        }
        
        return null;
    }

    /**
     * Calculate similarity between two word arrays
     */
    calculateSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        localStorage.removeItem('gemini_response_cache');
        this.initCommonResponses();
        console.log('🗑️ Cache cleared and reinitialized');
    }

    /**
     * Get cache stats
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let commonEntries = 0;
        
        this.cache.forEach(value => {
            if (now - value.timestamp < this.ttl) {
                validEntries++;
                if (value.isCommon) commonEntries++;
            }
        });
        
        return {
            total: this.cache.size,
            valid: validEntries,
            common: commonEntries,
            expired: this.cache.size - validEntries
        };
    }
}

// Create global instance
window.responseCache = new ResponseCache();

// Export class
window.ResponseCache = ResponseCache;

console.log('📦 Response Cache initialized');
