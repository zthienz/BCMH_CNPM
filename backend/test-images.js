/**
 * Script to test image accessibility via HTTP
 */

const http = require('http');

const images = [
    '/uploads/ao-ba-om.jpg',
    '/uploads/cho-tra-vinh.jpg', 
    '/uploads/chua-ang.jpg',
    '/uploads/chua-co.jpg',
    '/uploads/chua-giac-linh.jpg',
    '/uploads/chua-hang.jpg',
    '/uploads/chua-pho-quang.jpg',
    '/uploads/chua-vam-ray.jpg',
    '/uploads/cu-lao-long-tri.jpg',
    '/uploads/cu-lao-tan-quy.jpg',
    '/uploads/den-tho-bac.jpg',
    '/uploads/giao-duong-mac-bac.webp',
    '/uploads/nha-bao-tang.jpg',
    '/uploads/toan-canh-khu-du-lich-huynh-kha.jpg',
    '/uploads/toan-canh-rung-duoc.jpg'
];

async function testImage(imagePath) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: imagePath,
            method: 'HEAD'
        };

        const req = http.request(options, (res) => {
            resolve({
                path: imagePath,
                status: res.statusCode,
                success: res.statusCode === 200
            });
        });

        req.on('error', (err) => {
            resolve({
                path: imagePath,
                status: 'ERROR',
                success: false,
                error: err.message
            });
        });

        req.end();
    });
}

async function testAllImages() {
    console.log('🔍 Testing image accessibility via HTTP...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const imagePath of images) {
        const result = await testImage(imagePath);
        
        if (result.success) {
            console.log(`✅ ${result.path} - Status: ${result.status}`);
            successCount++;
        } else {
            console.log(`❌ ${result.path} - Status: ${result.status}${result.error ? ` (${result.error})` : ''}`);
            failCount++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results:`);
    console.log(`   Total images: ${images.length}`);
    console.log(`   Accessible: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    
    if (successCount === images.length) {
        console.log('\n🎉 All images are accessible via HTTP!');
    } else {
        console.log('\n⚠️  Some images are not accessible!');
    }
}

testAllImages();
