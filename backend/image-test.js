/**
 * Test script to verify all images are working
 */

const http = require('http');

async function testImageUrl(imageUrl) {
    return new Promise((resolve) => {
        const url = new URL(imageUrl);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'HEAD'
        };

        const req = http.request(options, (res) => {
            resolve({
                url: imageUrl,
                status: res.statusCode,
                success: res.statusCode === 200,
                size: res.headers['content-length'] || 'Unknown'
            });
        });

        req.on('error', (err) => {
            resolve({
                url: imageUrl,
                status: 'ERROR',
                success: false,
                error: err.message
            });
        });

        req.end();
    });
}

async function getDestinations() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/locations',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const destinations = JSON.parse(data);
                    resolve(destinations);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function testAllImages() {
    console.log('🖼️  Testing all destination images...\n');

    try {
        const destinations = await getDestinations();
        
        console.log(`Found ${destinations.length} destinations\n`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const destination of destinations) {
            if (destination.HinhAnh) {
                const imageUrl = `http://localhost:3001${destination.HinhAnh}`;
                const result = await testImageUrl(imageUrl);
                
                if (result.success) {
                    console.log(`✅ ${destination.TenDDDL}`);
                    console.log(`   URL: ${result.url}`);
                    console.log(`   Size: ${result.size} bytes`);
                    successCount++;
                } else {
                    console.log(`❌ ${destination.TenDDDL}`);
                    console.log(`   URL: ${result.url}`);
                    console.log(`   Status: ${result.status}`);
                    console.log(`   Error: ${result.error || 'Unknown'}`);
                    failCount++;
                }
                console.log('');
            } else {
                console.log(`⚠️  ${destination.TenDDDL} - No image path in database`);
                failCount++;
                console.log('');
            }
        }
        
        console.log('='.repeat(70));
        console.log(`📊 Image Test Results:`);
        console.log(`   Total destinations: ${destinations.length}`);
        console.log(`   Images working: ${successCount}`);
        console.log(`   Images failed: ${failCount}`);
        
        if (successCount === destinations.length) {
            console.log('\n🎉 ALL IMAGES ARE WORKING PERFECTLY!');
            console.log('🌟 Website should display all destination images correctly!');
        } else {
            console.log(`\n⚠️  ${failCount} images have issues.`);
        }
        
    } catch (error) {
        console.error('❌ Failed to fetch destinations:', error.message);
    }
}

testAllImages();
