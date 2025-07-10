const http = require('http');
const mysql = require('mysql');

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

const server = http.createServer((req, res) => {
  if (req.url === '/luotxem') {
    connection.query('SELECT * FROM LuotXem', (error, results) => {
      if (error) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: error.message }));
      }
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(results));
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
