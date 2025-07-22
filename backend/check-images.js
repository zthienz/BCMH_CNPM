/**
 * Script to check images in database
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Thien@160504',
    database: 'dulichtravinh',
    charset: 'utf8mb4'
};

async function checkImages() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check all destinations with images
        console.log('\n📋 Checking destinations with images...');
        const [results] = await connection.execute(
            'SELECT MADDDL, TenDDDL, HinhAnh FROM diadiemdulich ORDER BY MADDDL'
        );

        console.log('\n🖼️  Destinations and their images:');
        console.log('='.repeat(80));
        
        let withImages = 0;
        let withoutImages = 0;
        
        results.forEach(row => {
            const hasImage = row.HinhAnh && row.HinhAnh.trim() !== '';
            if (hasImage) {
                console.log(`✅ ${row.MADDDL}: ${row.TenDDDL}`);
                console.log(`   📸 Image: ${row.HinhAnh}`);
                withImages++;
            } else {
                console.log(`❌ ${row.MADDDL}: ${row.TenDDDL}`);
                console.log(`   📸 Image: NO IMAGE`);
                withoutImages++;
            }
            console.log('');
        });

        console.log('='.repeat(80));
        console.log(`📊 Summary:`);
        console.log(`   Total destinations: ${results.length}`);
        console.log(`   With images: ${withImages}`);
        console.log(`   Without images: ${withoutImages}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the check
checkImages();
