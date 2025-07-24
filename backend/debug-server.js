console.log('🔍 Starting debug server...');

try {
    console.log('📋 Checking environment...');
    console.log('Node version:', process.version);
    console.log('Working directory:', process.cwd());
    
    console.log('📦 Loading dependencies...');
    const express = require('express');
    console.log('✅ Express loaded');
    
    const mysql = require('mysql2/promise');
    console.log('✅ MySQL loaded');
    
    require('dotenv').config();
    console.log('✅ Environment loaded');
    console.log('PORT:', process.env.PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    console.log('🚀 Creating Express app...');
    const app = express();
    
    app.get('/health', (req, res) => {
        res.json({ success: true, message: 'Debug server is working!' });
    });
    
    const PORT = process.env.PORT || 3001;
    
    console.log('🌐 Starting server...');
    app.listen(PORT, () => {
        console.log(`✅ Debug server running on port ${PORT}`);
        console.log(`🔗 Test: http://localhost:${PORT}/health`);
    });
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
