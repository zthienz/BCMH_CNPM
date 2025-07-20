/**
 * Force Reload Chatbot with New API Key
 * Run this script in browser console to force reload chatbot
 */

(function() {
    console.log('🔄 Force reloading chatbot with new API key...');
    
    // Clear any cached API key
    localStorage.removeItem('gemini_api_key');
    
    // Set new API key in localStorage as backup
    localStorage.setItem('gemini_api_key', 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA');
    
    // Update GEMINI_CONFIG if available
    if (typeof window.GEMINI_CONFIG !== 'undefined') {
        window.GEMINI_CONFIG.API_KEY = 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA';
        console.log('✅ Updated GEMINI_CONFIG.API_KEY');
    }
    
    // Reload gemini config if function available
    if (typeof window.reloadGeminiConfig === 'function') {
        window.reloadGeminiConfig();
        console.log('✅ Reloaded Gemini configuration');
    }
    
    // Reinitialize floating chatbot if available
    if (typeof window.floatingChatbot !== 'undefined') {
        // Update API key in existing chatbot instance
        window.floatingChatbot.apiKey = 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA';
        console.log('✅ Updated floating chatbot API key');
    }
    
    // Test API key validity
    if (typeof window.isGeminiApiKeyValid === 'function') {
        const isValid = window.isGeminiApiKeyValid();
        console.log(`🔑 API key valid: ${isValid}`);
    }
    
    console.log('🎉 Chatbot reload complete! Try sending a message now.');
    
    // Show success message
    if (typeof window.floatingChatbot !== 'undefined' && window.floatingChatbot.addMessage) {
        setTimeout(() => {
            window.floatingChatbot.addMessage('system', '🔄 Chatbot đã được cập nhật với API key mới! Hãy thử gửi tin nhắn.');
        }, 1000);
    }
})();

// Also expose as global function
window.forceReloadChatbot = function() {
    console.log('🔄 Manual chatbot reload triggered...');
    
    // Clear cache
    localStorage.removeItem('gemini_api_key');
    localStorage.setItem('gemini_api_key', 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA');
    
    // Update config
    if (typeof window.GEMINI_CONFIG !== 'undefined') {
        window.GEMINI_CONFIG.API_KEY = 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA';
    }
    
    // Update chatbot
    if (typeof window.floatingChatbot !== 'undefined') {
        window.floatingChatbot.apiKey = 'AIzaSyCrw7zvE5wexXuBFe6n4wsWOEXvVfnjXwA';
    }
    
    console.log('✅ Manual reload complete!');
};
