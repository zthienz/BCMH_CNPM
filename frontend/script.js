// script.js

// --- Các hàm chung cho tất cả các trang ---

// Hiển thị thanh menu trên di động
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
}

// Các hàm cho Modal (Đăng nhập/Đăng ký)
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showLoginModal() {
    showModal('loginModal');
}

function showRegisterModal() {
    showModal('registerModal');
}

// Các hàm cho Chatbot
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    chatbotWindow.classList.toggle('hidden');
}

function sendChatMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(message, 'user');
        input.value = '';
        
        setTimeout(() => {
            const response = getChatbotResponse(message);
            addChatMessage(response, 'bot');
        }, 1000);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
        messageDiv.className = 'bg-blue-600 text-white p-3 rounded-lg mb-3 ml-12';
    } else {
        messageDiv.className = 'bg-gray-100 p-3 rounded-lg mb-3 mr-12';
    }
    
    messageDiv.innerHTML = `<p class="text-sm">${message}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getChatbotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('chùa') || lowerMessage.includes('temple')) {
        return 'Trà Vinh có rất nhiều ngôi chùa Khmer đẹp như Chùa Ông Mẹt, Chùa Hang. Bạn có muốn tôi gợi ý lịch trình tham quan không?';
    } else if (lowerMessage.includes('biển') || lowerMessage.includes('beach')) {
        return 'Biển Ba Động là bãi biển nổi tiếng ở Trà Vinh với cát trắng mịn và không khí trong lành. Thời gian tốt nhất để đi là sáng sớm hoặc chiều tà.';
    } else if (lowerMessage.includes('ăn') || lowerMessage.includes('food')) {
        return 'Trà Vinh có nhiều món ăn đặc sản như bánh ít lá gai, cơm dẻo, bánh xèo Khmer. Bạn muốn biết địa chỉ quán ăn nào cụ thể không?';
    } else if (lowerMessage.includes('đi') || lowerMessage.includes('transport')) {
        return 'Từ TP.HCM đến Trà Vinh khoảng 200km, bạn có thể đi xe khách, xe máy hoặc ô tô cá nhân. Thời gian di chuyển khoảng 4-5 tiếng.';
    } else if (lowerMessage.includes('lễ hội') || lowerMessage.includes('festival')) {
        return 'Lễ hội nổi tiếng nhất ở Trà Vinh là Ok Om Bok (cúng trăng) của người Khmer, thường diễn ra vào tháng 10 âm lịch.';
    } else {
        return 'Cảm ơn bạn đã hỏi! Tôi có thể giúp bạn tìm hiểu về địa điểm, ẩm thực, lễ hội và cách di chuyển ở Trà Vinh. Bạn có câu hỏi cụ thể nào không?';
    }
}

// --- Các hàm chạy khi trang được tải ---
document.addEventListener('DOMContentLoaded', function() {
    // Đánh dấu menu đang hoạt động
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        // Handle both full path and relative path
        if (link.getAttribute('href').endsWith(currentPage)) {
            link.classList.add('active');
        }
    });

    // Xử lý phím Enter trong chatbot
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                sendChatMessage();
            }
        });
    }

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', function(e) {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');
        if (e.target == loginModal) {
            hideModal('loginModal');
        }
        if (e.target == registerModal) {
            hideModal('registerModal');
        }
    });
});