/**
 * Chatbot API Addon for Tra Vinh Travel
 * Add these endpoints to your main server file (restful-api-server.js)
 */

// ================================
// CHATBOT & AI ENDPOINTS
// ================================

// POST /api/chatbot/chat - Chat with AI (Proxy to Gemini)
app.post('/api/chatbot/chat', authenticateToken, async (req, res) => {
    try {
        const { message, context = 'tourism' } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get Gemini API key from environment
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return res.status(500).json({
                success: false,
                message: 'Gemini API key not configured'
            });
        }

        // Create context-aware prompt
        let systemPrompt = '';
        switch (context) {
            case 'tourism':
                systemPrompt = 'Bạn là chuyên gia du lịch Trà Vinh. Trả lời NGẮN GỌN (tối đa 150 từ) về: ';
                break;
            case 'culture':
                systemPrompt = 'Bạn là chuyên gia văn hóa Khmer ở Trà Vinh. Trả lời về văn hóa, lịch sử: ';
                break;
            case 'travel_plan':
                systemPrompt = 'Bạn là chuyên gia lập kế hoạch du lịch Trà Vinh. Tạo lịch trình chi tiết cho: ';
                break;
            default:
                systemPrompt = 'Bạn là trợ lý du lịch Trà Vinh. Trả lời về: ';
        }

        // Prepare request to Gemini API
        const requestBody = {
            contents: [{
                parts: [{
                    text: systemPrompt + message
                }]
            }],
            generationConfig: {
                maxOutputTokens: context === 'travel_plan' ? 800 : 500,
                temperature: 0.4,
                topP: 0.9,
                topK: 20
            }
        };

        // Call Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;
        
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                success: false,
                message: 'Gemini API error',
                error: errorData.error?.message || 'API request failed'
            });
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return res.status(500).json({
                success: false,
                message: 'Invalid response from Gemini API'
            });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        // Log chat interaction (optional)
        console.log(`🤖 Chat: ${req.user?.email || 'Anonymous'} -> ${message.substring(0, 50)}...`);

        res.json({
            success: true,
            data: {
                message: aiResponse,
                context: context,
                timestamp: new Date().toISOString(),
                user: req.user?.email || 'anonymous'
            }
        });

    } catch (error) {
        console.error('Chatbot API error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/chatbot/suggestions - Get chat suggestions
app.get('/api/chatbot/suggestions', (req, res) => {
    const suggestions = {
        tourism: [
            "Những địa điểm du lịch nổi tiếng ở Trà Vinh?",
            "Giới thiệu về Ao Bà Om",
            "Các chùa Khmer đẹp ở Trà Vinh",
            "Ẩm thực đặc sản Trà Vinh",
            "Lễ hội truyền thống ở Trà Vinh"
        ],
        culture: [
            "Văn hóa Khmer ở Trà Vinh",
            "Lịch sử các chùa Khmer",
            "Trang phục truyền thống Khmer",
            "Nghệ thuật điêu khắc Khmer",
            "Ngôn ngữ và chữ viết Khmer"
        ],
        travel_plan: [
            "Lịch trình 1 ngày ở Trà Vinh",
            "Lịch trình 2-3 ngày ở Trà Vinh",
            "Du lịch Trà Vinh với gia đình",
            "Du lịch bụi Trà Vinh",
            "Phương tiện di chuyển ở Trà Vinh"
        ]
    };

    res.json({
        success: true,
        data: suggestions
    });
});

// POST /api/chatbot/feedback - Submit chat feedback
app.post('/api/chatbot/feedback', authenticateToken, async (req, res) => {
    try {
        const { message, response, rating, feedback } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Here you could save feedback to database
        // For now, just log it
        console.log('🔄 Chat Feedback:', {
            user: req.user?.email,
            rating,
            feedback,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                rating,
                feedback,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// GET /api/chatbot/stats - Get chatbot usage statistics (Admin only)
app.get('/api/chatbot/stats', authenticateToken, requireAdmin, (req, res) => {
    // Mock statistics - in real app, get from database
    const stats = {
        totalChats: 1250,
        totalUsers: 89,
        averageRating: 4.3,
        topQuestions: [
            { question: "Địa điểm du lịch nổi tiếng", count: 156 },
            { question: "Chùa Khmer", count: 134 },
            { question: "Ẩm thực Trà Vinh", count: 98 },
            { question: "Lịch trình du lịch", count: 87 },
            { question: "Lễ hội truyền thống", count: 76 }
        ],
        dailyUsage: [
            { date: "2024-01-15", chats: 45 },
            { date: "2024-01-16", chats: 52 },
            { date: "2024-01-17", chats: 38 },
            { date: "2024-01-18", chats: 61 },
            { date: "2024-01-19", chats: 49 }
        ]
    };

    res.json({
        success: true,
        data: stats
    });
});

// ================================
// INSTRUCTIONS TO ADD TO MAIN SERVER
// ================================

/*
To add these endpoints to your main server (restful-api-server.js):

1. Add this to your .env file:
   GEMINI_API_KEY=your_gemini_api_key_here

2. Add these endpoints before the "Start server" section

3. Update the /api/info endpoint to include chatbot endpoints:
   
   // Chatbot & AI
   'POST /api/chatbot/chat': 'Chat with AI assistant',
   'GET /api/chatbot/suggestions': 'Get chat suggestions',
   'POST /api/chatbot/feedback': 'Submit chat feedback',
   'GET /api/chatbot/stats': 'Get chatbot statistics (Admin only)',

4. Update the health check endpoint to include chatbot status:
   
   endpoints: {
       auth: '/api/auth/*',
       users: '/api/users/*',
       locations: '/api/locations/*',
       uploads: '/api/uploads/*',
       chatbot: '/api/chatbot/*'  // Add this line
   }

5. Make sure you have the fetch function available (Node.js 18+ or install node-fetch)
*/
