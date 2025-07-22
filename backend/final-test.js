/**
 * Final comprehensive test script
 */

const http = require('http');

async function testEndpoint(path, origin = 'http://127.0.0.1:5507') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET',
            headers: {
                'Origin': origin
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    path,
                    status: res.statusCode,
                    headers: res.headers,
                    dataLength: data.length,
                    success: res.statusCode === 200
                });
            });
        });

        req.on('error', (err) => {
            resolve({
                path,
                status: 'ERROR',
                error: err.message,
                success: false
            });
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Running Final Comprehensive Tests...\n');
    
    const tests = [
        '/api/locations',
        '/api/loaihinhdulich', 
        '/api/auth/session',
        '/uploads/ao-ba-om.jpg',
        '/uploads/chua-hang.jpg'
    ];
    
    let passCount = 0;
    let failCount = 0;
    
    for (const testPath of tests) {
        const result = await testEndpoint(testPath);
        
        if (result.success) {
            console.log(`✅ ${result.path}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   CORS Origin: ${result.headers['access-control-allow-origin'] || 'Not set'}`);
            console.log(`   Data Length: ${result.dataLength} bytes`);
            passCount++;
        } else {
            console.log(`❌ ${result.path}`);
            console.log(`   Status: ${result.status}`);
            console.log(`   Error: ${result.error || 'Unknown'}`);
            failCount++;
        }
        console.log('');
    }
    
    console.log('='.repeat(60));
    console.log(`📊 Final Test Results:`);
    console.log(`   Total tests: ${tests.length}`);
    console.log(`   Passed: ${passCount}`);
    console.log(`   Failed: ${failCount}`);
    
    if (passCount === tests.length) {
        console.log('\n🎉 ALL TESTS PASSED! Website should work perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the issues above.');
    }
}

runTests();
