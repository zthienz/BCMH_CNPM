@echo off
color 0A
title Du Lich Tra Vinh - Quick Chatbot Test
cls

echo ========================================
echo    DU LICH TRA VINH - CHATBOT TEST
echo ========================================
echo.
echo 🤖 Testing Gemini AI Chatbot Connection
echo 🔑 API Key: AIzaSyBK7EVuhFTQd6ehqYXhieT-ACbpBqZ1QAo
echo 🌐 Model: gemini-2.0-flash-exp
echo.
echo 📋 Test Pages:
echo    1. API Test: file:///d:/BCMH_CNPM/frontend/test-gemini-api.html
echo    2. Main Site: file:///d:/BCMH_CNPM/frontend/index.html
echo.
echo 🔄 Opening test pages...

start "" "file:///d:/BCMH_CNPM/frontend/test-gemini-api.html"

timeout /t 3 /nobreak >nul

start "" "file:///d:/BCMH_CNPM/frontend/index.html"

echo.
echo ✅ Test pages opened!
echo.
echo 📝 Test Instructions:
echo    1. Check API configuration status
echo    2. Test API key connection
echo    3. Send test chat message
echo    4. Verify chatbot works on main site
echo.
echo 🎯 Expected Results:
echo    - API Key Status: ✅ Working
echo    - Chat Response: Real AI response (not mock)
echo    - Chatbot: Opens and responds properly
echo.
pause
