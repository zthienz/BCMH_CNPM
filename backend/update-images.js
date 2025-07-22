/**
 * Script to update database with image paths for existing destinations
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

async function updateImages() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Image mappings based on destination names/IDs
        const imageUpdates = [
            { id: 'DD15', image: '/uploads/ao-ba-om.jpg', name: 'Ao Bà Om' },
            { id: 'DD01', image: '/uploads/chua-hang.jpg', name: 'Chùa Hang' },
            { id: 'DD04', image: '/uploads/nha-bao-tang.jpg', name: 'Bảo tàng Văn hóa Khmer' },
            { id: 'DD03', image: '/uploads/chua-ang.jpg', name: 'Chùa Âng' },
            { id: 'DD02', image: '/uploads/chua-co.jpg', name: 'Chùa Cò' },
            { id: 'DD05', image: '/uploads/chua-vam-ray.jpg', name: 'Chùa Vàm Rây' },
            { id: 'DD06', image: '/uploads/chua-pho-quang.jpg', name: 'Chùa Phổ Quang' },
            { id: 'DD07', image: '/uploads/toan-canh-rung-duoc.jpg', name: 'Khu sinh thái rừng đước' },
            { id: 'DD08', image: '/uploads/toan-canh-khu-du-lich-huynh-kha.jpg', name: 'Khu du lịch Huỳnh Kha' },
            { id: 'DD09', image: '/uploads/cu-lao-tan-quy.jpg', name: 'Cù lao Tân Quy' },
            { id: 'DD10', image: '/uploads/cu-lao-long-tri.jpg', name: 'Cù lao Long Trị' },
            { id: 'DD11', image: '/uploads/cho-tra-vinh.jpg', name: 'Chợ Trà Vinh' },
            { id: 'DD12', image: '/uploads/giao-duong-mac-bac.webp', name: 'Giáo đường Mặc Bắc' },
            { id: 'DD13', image: '/uploads/chua-giac-linh.jpg', name: 'Di tích Chùa Giác Linh' },
            { id: 'DD14', image: '/uploads/den-tho-bac.jpg', name: 'Đền thờ Bác Hồ' }
        ];

        console.log('📸 Updating image paths...');
        
        for (const update of imageUpdates) {
            try {
                // Check if destination exists
                const [existing] = await connection.execute(
                    'SELECT MADDDL, TenDDDL FROM diadiemdulich WHERE MADDDL = ?',
                    [update.id]
                );

                if (existing.length > 0) {
                    // Update image path
                    await connection.execute(
                        'UPDATE diadiemdulich SET HinhAnh = ? WHERE MADDDL = ?',
                        [update.image, update.id]
                    );
                    console.log(`   ✅ Updated ${update.id}: ${existing[0].TenDDDL} -> ${update.image}`);
                } else {
                    console.log(`   ⚠️  Destination ${update.id} (${update.name}) not found in database`);
                }
            } catch (error) {
                console.error(`   ❌ Error updating ${update.id}:`, error.message);
            }
        }

        // Verify updates
        console.log('\n📋 Verifying updates...');
        const [results] = await connection.execute(
            'SELECT MADDDL, TenDDDL, HinhAnh FROM diadiemdulich WHERE HinhAnh IS NOT NULL ORDER BY MADDDL'
        );

        console.log('\n🖼️  Destinations with images:');
        results.forEach(row => {
            console.log(`   ${row.MADDDL}: ${row.TenDDDL} -> ${row.HinhAnh}`);
        });

        console.log(`\n✅ Successfully updated ${results.length} destinations with images`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the update
updateImages();
