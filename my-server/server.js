// ===================================================================
//  API SERVER FOR 'DuLichTraVinh' APPLICATION (Bản sửa lỗi cuối cùng)
// ===================================================================
// - [SỬA LỖI] Đổi cổng mặc định sang 3001 để tránh xung đột.
// - [SỬA LỖI] Thêm xử lý lỗi 'EADDRINUSE' để server không bị crash.
// - [SỬA LỖI] Sửa yêu cầu 'fs' bị lỗi (từ 'fs' sang require('fs')).
// ===================================================================

const http = require('http');
const mysql = require('mysql');
const url = require('url');
const fs = require('fs'); // SỬA LỖI: Thiếu require()
const path = require('path');

// --- 1. CẤU HÌNH KẾT NỐI DATABASE ---
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Thien@160504',
  database: 'DuLichTraVinh',
  charset: 'utf8mb4'
});

// --- 2. KẾT NỐI TỚI MYSQL ---
connection.connect(err => {
  if (err) {
    console.error('LỖI: Kết nối MySQL thất bại. Vui lòng kiểm tra cấu hình.');
    console.error(err.stack);
    process.exit(1);
  }
  console.log('>> Đã kết nối MySQL thành công! (ID: ' + connection.threadId + ')');
});

// --- 3. TẠO SERVER HTTP ---
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // --- ROUTING ---
  if (pathname.startsWith('/images/')) {
    serveStaticImage(pathname, res);
  } else if (pathname === '/api/loaihinhdulich') {
    getAllCategories(res);
  } else if (pathname.match(/^\/api\/diadiemdulich\/([a-zA-Z0-9]+)$/)) {
    const id = pathname.split('/')[3];
    getDestinationById(id, res);
  } else if (pathname === '/api/diadiemdulich') {
    getDestinations(query, res);
  } else if (pathname === '/check-db-images') {
    checkDatabaseImages(res);
  } else if (pathname === '/update-db-images') {
    updateDatabaseImages(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Lỗi 404: Không tìm thấy tài nguyên.' }));
  }
});

// --- CÁC HÀM XỬ LÝ LOGIC (Ẩn đi cho gọn, không có thay đổi lớn) ---
function serveStaticImage(imagePath, res) {
  const safePath = path.normalize(imagePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(__dirname, safePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.error(`Không tìm thấy ảnh: ${fullPath}`);
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ message: 'Không tìm thấy hình ảnh.' }));
    }
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}
function getAllCategories(res) { /* giữ nguyên */ connection.query('SELECT * FROM LoaiHinhDuLich ORDER BY TenLHDL ASC', (error, results) => { if (error) { console.error('Lỗi truy vấn LoaiHinhDuLich:', error); res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ error: 'Lỗi máy chủ.' })); } res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(results)); }); }
function getDestinationById(id, res) { /* giữ nguyên */ const sql = 'SELECT * FROM DiaDiemDuLich WHERE MADDDL = ?'; connection.query(sql, [id], (error, results) => { if (error) { console.error(`Lỗi truy vấn ID ${id}:`, error); res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ error: 'Lỗi máy chủ.' })); } if (results.length === 0) { res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ message: 'Không tìm thấy.' })); } res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(results[0])); }); }
function getDestinations(query, res) { /* giữ nguyên */ let sql = 'SELECT * FROM DiaDiemDuLich'; const conditions = []; const params = []; if (query.search) { conditions.push('(TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?)'); const searchTerm = `%${query.search}%`; params.push(searchTerm, searchTerm, searchTerm); } if (query.loai) { conditions.push('MALHDL = ?'); params.push(query.loai); } if (conditions.length > 0) { sql += ' WHERE ' + conditions.join(' AND '); } sql += ' ORDER BY TenDDDL ASC'; connection.query(sql, params, (error, results) => { if (error) { console.error('Lỗi truy vấn danh sách:', error); res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ error: 'Lỗi máy chủ.' })); } res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(results)); }); }
function checkDatabaseImages(res) { /* giữ nguyên */ const sql = 'SELECT MADDDL, TenDDDL, HinhAnh FROM DiaDiemDuLich ORDER BY MADDDL ASC'; connection.query(sql, (error, results) => { if (error) { res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(JSON.stringify({ error: 'Lỗi máy chủ.' })); } const imageStatus = results.map(item => ({ id: item.MADDDL, name: item.TenDDDL, imagePath: item.HinhAnh, hasImage: !!item.HinhAnh })); const stats = { total: results.length, withImages: imageStatus.filter(i => i.hasImage).length, withoutImages: imageStatus.filter(i => !i.hasImage).length }; res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ stats, details: imageStatus })); }); }
function updateDatabaseImages(res) { /* giữ nguyên */ const updateQueries = [ "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-hang.jpg' WHERE TenDDDL LIKE '%Chùa Hang%'" ]; let completed = 0, results = []; updateQueries.forEach((query, index) => { connection.query(query, (error, result) => { if (error) results.push({ query: index + 1, error: error.message }); else results.push({ query: index + 1, success: true, affected: result.affectedRows }); completed++; if (completed === updateQueries.length) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify({ message: `Đã thực hiện ${updateQueries.length} truy vấn`, results })); } }); }); }


// --- 4. KHỞI CHẠY SERVER ---
const PORT = 3001; // SỬA LỖI: Đổi cổng sang 3001 để tránh xung đột

server.listen(PORT, () => {
  console.log(`>> Server đang chạy thành công tại http://localhost:${PORT}`);
  console.log('Các API có sẵn:');
  console.log(`   - GET /api/diadiemdulich`);
  console.log(`   - GET /api/loaihinhdulich`);
});

// SỬA LỖI: Bắt sự kiện lỗi của server
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`LỖI: Cổng ${PORT} đã được chương trình khác sử dụng.`);
    console.error('Hãy thử đổi sang một cổng khác (ví dụ: 3002, 5000) trong file server.js.');
  } else {
    console.error('Đã xảy ra lỗi khi khởi động server:', err);
  }
  process.exit(1);
});