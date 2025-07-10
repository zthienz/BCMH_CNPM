// ===================================================================
//  API SERVER FOR 'DuLichTraVinh' APPLICATION
// ===================================================================
// - Cung cấp API để lấy dữ liệu địa điểm, loại hình du lịch.
// - Phục vụ các tệp hình ảnh tĩnh từ thư mục /public/images.
// - Đã loại bỏ các endpoint gỡ lỗi/thiết lập để mã nguồn sạch hơn.
// ===================================================================

const http = require('http');
const mysql = require('mysql');
const url = require('url');
const fs = require('fs');
const path = require('path');

// --- 1. CẤU HÌNH KẾT NỐI DATABASE ---
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // **QUAN TRỌNG**: Nên dùng biến môi trường cho mật khẩu trong thực tế
  // Ví dụ: password: process.env.DB_PASSWORD
  password: 'Thien@160504',
  database: 'DuLichTraVinh',
  charset: 'utf8mb4' // Đảm bảo hỗ trợ tiếng Việt
});

// --- 2. KẾT NỐI TỚI MYSQL ---
connection.connect(err => {
  if (err) {
    console.error('LỖI: Kết nối MySQL thất bại. Vui lòng kiểm tra cấu hình.');
    console.error(err.stack);
    // Thoát ứng dụng nếu không thể kết nối DB
    process.exit(1); 
  }
  console.log('>> Đã kết nối MySQL thành công! (ID: ' + connection.threadId + ')');
});

// --- 3. TẠO SERVER HTTP ---
const server = http.createServer((req, res) => {
  // Bật CORS cho phép các domain khác gọi tới API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Xử lý các request OPTIONS (trình duyệt gửi trước khi gọi POST, PUT, DELETE)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // --- ROUTING: XỬ LÝ CÁC YÊU CẦU ---

  // A. PHỤC VỤ TỆP HÌNH ẢNH TĨNH
  // URL có dạng: /images/chua_hang.jpg
  if (pathname.startsWith('/images/')) {
    serveStaticImage(pathname, res);
  }
  // B. API LẤY DANH SÁCH LOẠI HÌNH DU LỊCH
  // URL: /api/loaihinhdulich
  else if (pathname === '/api/loaihinhdulich') {
    getAllCategories(res);
  }
  // C. API LẤY CHI TIẾT MỘT ĐỊA ĐIỂM
  // URL có dạng: /api/diadiemdulich/DD03
  else if (pathname.match(/^\/api\/diadiemdulich\/([a-zA-Z0-9]+)$/)) {
    const id = pathname.split('/')[3];
    getDestinationById(id, res);
  }
  // D. API LẤY DANH SÁCH ĐỊA ĐIỂM (CÓ TÌM KIẾM VÀ LỌC)
  // URL: /api/diadiemdulich?search=chùa&loai=LH03
  else if (pathname === '/api/diadiemdulich') {
    getDestinations(query, res);
  }
  // E. KIỂM TRA CỘT HÌNH ẢNH TRONG DATABASE
  else if (pathname === '/check-db-images') {
    checkDatabaseImages(res);
  }
  // F. CẬP NHẬT HÌNH ẢNH TRONG DATABASE
  else if (pathname === '/update-db-images') {
    updateDatabaseImages(res);
  }
  // G. LỖI 404 NOT FOUND
  else {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Lỗi 404: Không tìm thấy tài nguyên.' }));
  }
});

// --- CÁC HÀM XỬ LÝ LOGIC ---

/**
 * Phục vụ tệp hình ảnh từ thư mục public/images
 * @param {string} imagePath - Đường dẫn ảnh từ URL (ví dụ: /images/chua_hang.jpg)
 * @param {http.ServerResponse} res - Đối tượng response
 */
function serveStaticImage(imagePath, res) {
  // Ngăn chặn tấn công path traversal (vd: /images/../../server.js)
  const safePath = path.normalize(imagePath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(__dirname, safePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.error(`Không tìm thấy ảnh: ${fullPath}`);
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Không tìm thấy hình ảnh.' }));
      return;
    }
    
    // Xác định content-type dựa trên đuôi file
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
      '.png': 'image/png', '.gif': 'image/gif',
      '.svg': 'image/svg+xml', '.webp': 'image/webp'
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Lấy tất cả loại hình du lịch
 * @param {http.ServerResponse} res
 */
function getAllCategories(res) {
  connection.query('SELECT * FROM LoaiHinhDuLich ORDER BY TenLHDL ASC', (error, results) => {
    if (error) {
      console.error('Lỗi truy vấn LoaiHinhDuLich:', error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Lỗi máy chủ khi truy vấn dữ liệu.' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(results));
  });
}

/**
 * Lấy thông tin chi tiết một địa điểm bằng ID
 * @param {string} id - Mã địa điểm (MADDDL)
 * @param {http.ServerResponse} res
 */
function getDestinationById(id, res) {
  const sql = 'SELECT * FROM DiaDiemDuLich WHERE MADDDL = ?';
  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error(`Lỗi truy vấn địa điểm ID ${id}:`, error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Lỗi máy chủ khi truy vấn dữ liệu.' }));
    }
    if (results.length === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ message: 'Không tìm thấy địa điểm này.' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(results[0]));
  });
}

/**
 * Lấy danh sách địa điểm, hỗ trợ tìm kiếm và lọc
 * @param {object} query - Các tham số từ URL (ví dụ: { search: 'chùa', loai: 'LH03' })
 * @param {http.ServerResponse} res
 */
function getDestinations(query, res) {
  let sql = 'SELECT * FROM DiaDiemDuLich';
  const conditions = [];
  const params = [];

  // Xử lý tìm kiếm
  if (query.search) {
    conditions.push('(TenDDDL LIKE ? OR MoTa LIKE ? OR DiaChi LIKE ?)');
    const searchTerm = `%${query.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Xử lý lọc theo loại hình du lịch (MALHDL)
  if (query.loai) {
    conditions.push('MALHDL = ?');
    params.push(query.loai);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY TenDDDL ASC';

  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error('Lỗi truy vấn danh sách địa điểm:', error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Lỗi máy chủ khi truy vấn dữ liệu.' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(results));
  });
}

/**
 * Kiểm tra cột hình ảnh trong database
 * @param {http.ServerResponse} res
 */
function checkDatabaseImages(res) {
  const sql = 'SELECT MADDDL, TenDDDL, HinhAnh FROM DiaDiemDuLich ORDER BY MADDDL ASC';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Lỗi kiểm tra cột hình ảnh:', error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Lỗi máy chủ khi truy vấn dữ liệu.' }));
    }

    const imageStatus = results.map(item => ({
      id: item.MADDDL,
      name: item.TenDDDL,
      imagePath: item.HinhAnh,
      hasImage: item.HinhAnh && item.HinhAnh.trim() !== ''
    }));

    const stats = {
      total: results.length,
      withImages: imageStatus.filter(item => item.hasImage).length,
      withoutImages: imageStatus.filter(item => !item.hasImage).length
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      stats: stats,
      details: imageStatus
    }));
  });
}

/**
 * Cập nhật hình ảnh trong database với các file có sẵn
 * @param {http.ServerResponse} res
 */
function updateDatabaseImages(res) {
  const updateQueries = [
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-hang.jpg' WHERE TenDDDL LIKE '%Chùa Hang%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-co.jpg' WHERE TenDDDL LIKE '%Chùa Cò%' OR TenDDDL LIKE '%Nôdol%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/ao-ba-om.jpg' WHERE TenDDDL LIKE '%Ao Bà Om%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/nha-bao-tang.jpg' WHERE TenDDDL LIKE '%Bảo tàng%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chotravinh.webp' WHERE TenDDDL LIKE '%Chợ%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-ang.jpg' WHERE TenDDDL LIKE '%Chùa Ang%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-giac-linh.jpg' WHERE TenDDDL LIKE '%Giác Linh%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/chua-pho-quang.jpg' WHERE TenDDDL LIKE '%Phổ Quang%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/Chua-Vam-Ray.jpg' WHERE TenDDDL LIKE '%Vàm Ray%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/cu-lao-long-tri.jpg' WHERE TenDDDL LIKE '%Long Trí%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/cu-lao-tan-quy.jpg' WHERE TenDDDL LIKE '%Tân Quý%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/den-tho-bac.jpg' WHERE TenDDDL LIKE '%Đền Thổ Bác%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/giao-duong-mac-bac.webp' WHERE TenDDDL LIKE '%Giáo đường%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/huynh-kha.jpg' WHERE TenDDDL LIKE '%Huỳnh Khá%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/rung_duoc.jpg' WHERE TenDDDL LIKE '%Rừng%'",
    "UPDATE DiaDiemDuLich SET HinhAnh = 'images/bien-ba-dong.jpg' WHERE TenDDDL LIKE '%Biển%' OR TenDDDL LIKE '%Ba Động%'"
  ];

  let completed = 0;
  const results = [];

  updateQueries.forEach((query, index) => {
    connection.query(query, (error, result) => {
      if (error) {
        console.error(`Lỗi cập nhật hình ảnh ${index + 1}:`, error);
        results.push({ query: index + 1, error: error.message });
      } else {
        results.push({ query: index + 1, success: true, affected: result.affectedRows });
      }

      completed++;
      if (completed === updateQueries.length) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          message: `Đã thực hiện ${updateQueries.length} truy vấn cập nhật`,
          results: results
        }));
      }
    });
  });
}


// --- 4. KHỞI CHẠY SERVER ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`>> Server đang chạy tại http://localhost:${PORT}`);
  console.log('Các API có sẵn:');
  console.log(`   - GET /api/diadiemdulich`);
  console.log(`   - GET /api/diadiemdulich/:id`);
  console.log(`   - GET /api/loaihinhdulich`);
  console.log('Phục vụ ảnh tại: /images/<tên_ảnh>');
});