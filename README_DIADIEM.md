# Hướng dẫn sử dụng tính năng Địa điểm du lịch

## Tổng quan
Tính năng này kết nối trực tiếp với database MySQL có sẵn của bạn, cho phép người dùng tìm kiếm và xem thông tin chi tiết về các địa điểm du lịch tại Trà Vinh với giao diện đẹp và trải nghiệm người dùng tốt.

## ✅ **Đã kết nối thành công với database:**
- Database: `DulichTraVinh`
- Bảng chính: `diadiemdulich`
- Bảng loại hình: `loaihinhdulich`
- Dữ liệu thực tế: 2 địa điểm có sẵn

## Các tính năng chính

### 1. Thanh tìm kiếm thông minh
- Tìm kiếm theo tên địa điểm, mô tả, hoặc địa chỉ
- Tìm kiếm real-time với debounce (500ms)
- Hỗ trợ tìm kiếm tiếng Việt có dấu

### 2. Bộ lọc theo loại hình
- Chùa, đền, miếu
- Biển, bãi tắm
- Rừng, sinh thái
- Khu du lịch
- Di tích lịch sử
- Làng nghề

### 3. Hiển thị thông tin chi tiết
- Tên địa điểm
- Mô tả chi tiết
- Địa chỉ
- Đánh giá (sao)
- Lượt xem
- Giá vé
- Giờ mở cửa/đóng cửa
- Số điện thoại liên hệ

### 4. Giao diện đẹp
- Responsive design
- Hiệu ứng hover và animation
- Loading indicator
- Modal chi tiết
- Color coding theo loại địa điểm

## Cài đặt và chạy

### 1. Cài đặt database
```sql
-- Chạy file SQL để tạo bảng và dữ liệu mẫu
mysql -u root -p DulichTraVinh < database/create_diadiemdulich_table.sql
```

### 2. Chạy server
```bash
cd my-server
node server.js
```
Server sẽ chạy tại: http://localhost:3000

### 3. Mở trang web
Mở file `frontend/dia-diem.html` trong trình duyệt hoặc chạy qua web server.

## API Endpoints

### GET /diadiemdulich
Lấy danh sách tất cả địa điểm du lịch

**Query Parameters:**
- `search`: Từ khóa tìm kiếm
- `loai_dia_diem`: Lọc theo loại địa điểm

**Ví dụ:**
```
GET /diadiemdulich?search=chùa&loai_dia_diem=chua
```

### GET /diadiemdulich/:id
Lấy thông tin chi tiết một địa điểm theo ID

**Ví dụ:**
```
GET /diadiemdulich/1
```

## Cấu trúc database thực tế

### Bảng diadiemdulich
```sql
-- Cấu trúc bảng thực tế từ database của bạn
MADDDL varchar(10) NOT NULL PRIMARY KEY,  -- Mã địa điểm du lịch
TenDDDL varchar(100) NOT NULL,            -- Tên địa điểm du lịch
DiaChi varchar(500),                      -- Địa chỉ
MoTa TEXT,                                -- Mô tả
MALHDL varchar(10)                        -- Mã loại hình du lịch (FK)
```

### Bảng loaihinhdulich
```sql
-- Bảng loại hình du lịch
MALHDL varchar(10) NOT NULL PRIMARY KEY,  -- Mã loại hình
TenLHDL varchar(100) NOT NULL             -- Tên loại hình

-- Dữ liệu có sẵn:
-- LH01: "Du lịch sinh thái"
-- LH02: "Du lịch thắng cảnh thiên nhiên"
-- LH03: "Du lịch lịch sử - tâm linh"
```

## Files đã tạo/cập nhật

1. **frontend/dia-diem.html** - Trang chính với thanh tìm kiếm và hiển thị kết quả
2. **frontend/destinations.css** - CSS tùy chỉnh cho giao diện đẹp
3. **my-server/server.js** - API server với endpoints cho địa điểm du lịch
4. **database/create_diadiemdulich_table.sql** - Script tạo bảng và dữ liệu mẫu

## Tính năng nâng cao có thể phát triển

1. **Bản đồ tương tác** - Tích hợp Google Maps
2. **Đánh giá và bình luận** - Cho phép người dùng đánh giá
3. **Đặt lịch tham quan** - Hệ thống booking
4. **Chia sẻ mạng xã hội** - Share lên Facebook, Zalo
5. **Lưu địa điểm yêu thích** - Wishlist
6. **Gợi ý địa điểm** - AI recommendation
7. **Thông báo sự kiện** - Events và festivals
8. **Hình ảnh 360°** - Virtual tour
9. **Đánh giá bằng giọng nói** - Voice review
10. **Chatbot hỗ trợ** - AI assistant

## Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, đảm bảo server đã được cấu hình đúng headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Lỗi kết nối database
Kiểm tra thông tin kết nối MySQL trong `server.js`:
```javascript
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'DulichTraVinh'
});
```

### Dữ liệu không hiển thị
1. Kiểm tra server có chạy không
2. Kiểm tra database có dữ liệu không
3. Mở Developer Tools để xem lỗi JavaScript

## Liên hệ hỗ trợ
Nếu có vấn đề gì, vui lòng liên hệ để được hỗ trợ!
