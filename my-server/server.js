const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

// Tạo kết nối MySQL
const connection = mysql.createConnection({
  host: 'localhost',       // hoặc IP database nếu không phải local
  user: 'root',            // tên người dùng MySQL
  password: 'Thien@160504',            // mật khẩu (nếu có)
  database: 'DulichTraVinh' // tên CSDL bạn đã tạo
});

// Kết nối đến database
connection.connect(err => {
  if (err) {
    console.error('Kết nối MySQL thất bại: ' + err.stack);
    return;
  }
  console.log('Đã kết nối MySQL thành công, ID: ' + connection.threadId);
});

const url = require('url');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === '/luotxem') {
    connection.query('SELECT * FROM LuotXem', (error, results) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results));
    });
  } else if (pathname === '/diadiemdulich') {
    // API endpoint for tourist destinations
    let sqlQuery = 'SELECT * FROM diadiemdulich';
    let queryParams = [];

    // Handle search functionality (using actual column names)
    if (query.search) {
      sqlQuery += ' WHERE TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?';
      const searchTerm = `%${query.search}%`;
      queryParams = [searchTerm, searchTerm, searchTerm];
    }

    // Handle category filter (using MALHDL)
    if (query.loai_dia_diem) {
      if (queryParams.length > 0) {
        sqlQuery += ' AND MALHDL = ?';
      } else {
        sqlQuery += ' WHERE MALHDL = ?';
      }
      queryParams.push(query.loai_dia_diem);
    }

    // Add ordering (using actual column names)
    sqlQuery += ' ORDER BY TenDDDL ASC';

    console.log('Executing query:', sqlQuery, 'with params:', queryParams);

    connection.query(sqlQuery, queryParams, (error, results) => {
      if (error) {
        console.error('Database error:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
          error: error.message,
          code: error.code,
          sqlState: error.sqlState
        }));
      }
      console.log('Query results:', results.length, 'records found');
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results));
    });
  } else if (pathname.startsWith('/diadiemdulich/') && pathname.split('/').length === 3) {
    // Get specific destination by ID
    const id = pathname.split('/')[2];
    console.log('Getting destination with ID:', id);
    connection.query('SELECT * FROM diadiemdulich WHERE MADDDL = ?', [id], (error, results) => {
      if (error) {
        console.error('Database error for ID query:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      if (results.length === 0) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Không tìm thấy địa điểm' }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results[0]));
    });
  } else if (pathname === '/test-db') {
    // Test database connection
    connection.query('SHOW TABLES', (error, results) => {
      if (error) {
        console.error('Database test error:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message, connected: false }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        connected: true,
        tables: results.map(row => Object.values(row)[0]),
        message: 'Database connection successful'
      }));
    });
  } else if (pathname === '/describe-table') {
    // Describe diadiemdulich table structure
    connection.query('DESCRIBE diadiemdulich', (error, results) => {
      if (error) {
        console.error('Describe table error:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        structure: results,
        message: 'Table structure retrieved successfully'
      }));
    });
  } else if (pathname === '/table-info') {
    // Get complete table information
    const queries = [
      'DESCRIBE diadiemdulich',
      'SELECT * FROM diadiemdulich LIMIT 5',
      'SELECT COUNT(*) as total_records FROM diadiemdulich',
      'SHOW TABLES LIKE "%loai%" OR LIKE "%hinh%"'
    ];

    const results = {};
    let completed = 0;

    // Execute all queries
    connection.query(queries[0], (error, structure) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      results.structure = structure;
      completed++;

      connection.query(queries[1], (error, sample_data) => {
        if (error) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          return res.end(JSON.stringify({ error: error.message }));
        }
        results.sample_data = sample_data;
        completed++;

        connection.query(queries[2], (error, count) => {
          if (error) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({ error: error.message }));
          }
          results.total_records = count[0].total_records;
          completed++;

          connection.query('SHOW TABLES', (error, tables) => {
            if (error) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              return res.end(JSON.stringify({ error: error.message }));
            }
            results.all_tables = tables.map(row => Object.values(row)[0]);
            completed++;

            if (completed === 4) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(results));
            }
          });
        });
      });
    });
  } else if (pathname === '/loaihinhdulich') {
    // Get all categories from loaihinhdulich table
    connection.query('SELECT * FROM loaihinhdulich', (error, results) => {
      if (error) {
        console.error('Error getting categories:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results));
    });
  } else if (pathname.startsWith('/images/')) {
    // Serve static images
    const imagePath = path.join(__dirname, '..', 'frontend', pathname);

    fs.readFile(imagePath, (error, data) => {
      if (error) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        return res.end('Image not found');
      }

      // Get file extension to set correct content type
      const ext = path.extname(imagePath).toLowerCase();
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      };

      const contentType = contentTypes[ext] || 'image/jpeg';
      res.writeHead(200, {'Content-Type': contentType});
      res.end(data);
    });
  } else if (pathname === '/add-image-column') {
    // Add image column to diadiemdulich table if not exists
    const addColumnQuery = `
      ALTER TABLE diadiemdulich
      ADD COLUMN HinhAnh VARCHAR(255) DEFAULT NULL
    `;

    connection.query(addColumnQuery, (error, results) => {
      if (error) {
        console.error('Error adding image column:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        success: true,
        message: 'Image column added successfully'
      }));
    });
  } else if (pathname === '/update-sample-images') {
    // Update sample data with image paths
    const updateQueries = [
      "UPDATE diadiemdulich SET HinhAnh = 'images/ao-ba-om.svg' WHERE TenDDDL LIKE '%Ao B%Om%'",
      "UPDATE diadiemdulich SET HinhAnh = 'images/bien-ba-dong.svg' WHERE TenDDDL LIKE '%Biển%' OR TenDDDL LIKE '%Ba Động%'",
      "UPDATE diadiemdulich SET HinhAnh = 'images/bao-tang-van-hoa-khmer.svg' WHERE TenDDDL LIKE '%Bảo tàng%' OR TenDDDL LIKE '%Văn hóa%'",
      "UPDATE diadiemdulich SET HinhAnh = 'images/cho-tra-vinh.svg' WHERE TenDDDL LIKE '%Chợ%' OR TenDDDL LIKE '%Trà Vinh%'"
    ];

    let completed = 0;
    const results = [];

    updateQueries.forEach((query, index) => {
      connection.query(query, (error, result) => {
        if (error) {
          console.error(`Error updating image ${index + 1}:`, error);
          results.push({ error: error.message });
        } else {
          results.push({ success: true, affected: result.affectedRows });
        }

        completed++;
        if (completed === updateQueries.length) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            message: `Sample images updated (${updateQueries.length} queries executed)`,
            results: results
          }));
        }
      });
    });
  } else if (pathname === '/destinations-with-images') {
    // Get destinations that have images
    connection.query('SELECT MADDDL, TenDDDL, HinhAnh FROM diadiemdulich WHERE HinhAnh IS NOT NULL AND HinhAnh != ""', (error, results) => {
      if (error) {
        console.error('Error getting destinations with images:', error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        count: results.length,
        destinations: results
      }));
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello from Node.js server!');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
