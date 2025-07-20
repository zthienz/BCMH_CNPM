/**
 * Test Registration Directly
 */

const fetch = require('node-fetch');

async function testRegister() {
    try {
        console.log('🔄 Testing registration directly...');
        
        const testData = {
            username: 'Test User Direct',
            email: 'direct-test@example.com',
            password: '123456'
        };
        
        console.log('📝 Sending data:', testData);
        
        const response = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers));
        
        const result = await response.json();
        console.log('📋 Response data:', result);
        
        if (result.success) {
            console.log('✅ Registration successful!');
        } else {
            console.log('❌ Registration failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testRegister();
