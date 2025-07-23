# 🚀 Du Lich Tra Vinh - Auto Start Guide

## 🎯 **Mục tiêu**
Đảm bảo khi restart máy tính và mở website, API sẽ tự động kết nối mà không bị lỗi.

## ✅ **Đã thiết lập**

### 🛡️ **Auto-Start System**
- ✅ **Windows Startup Shortcut** - Tự động chạy khi boot
- ✅ **Infinite Restart Protection** - Không bao giờ dừng
- ✅ **Robust Monitoring** - Health check + CORS verification
- ✅ **Zombie Process Cleanup** - Kill processes cũ
- ✅ **Network Ready Check** - Đợi network sẵn sàng

### 📁 **Files đã tạo**
- `auto-start-on-boot.bat` - Script chính auto-start
- `simple-monitor.bat` - Monitor mạnh mẽ với CORS check
- `test-auto-start.bat` - Test auto-start functionality
- `check-server-status.bat` - Kiểm tra trạng thái server

## 🔄 **Quy trình Auto-Start**

### **Khi Windows Boot:**
1. **Đợi 45 giây** - Hệ thống boot hoàn toàn
2. **Check network** - Ping localhost để đảm bảo network ready
3. **Kill old processes** - Cleanup Node.js và port 3001
4. **Verify Node.js** - Đảm bảo Node.js có trong PATH
5. **Start monitor** - Chạy robust monitor với infinite restart
6. **Health + CORS check** - Verify API và CORS mỗi 30 giây

### **Monitor Features:**
- 🔍 **Health check** mỗi 30 giây
- 🌐 **CORS verification** với Origin header
- 🔄 **Auto-restart** khi server fail
- 🛡️ **Zombie process detection**
- ⚡ **Fast recovery** (15 giây startup)

## 🧪 **Testing**

### **Test Auto-Start:**
```bash
test-auto-start.bat
```

### **Check Server Status:**
```bash
check-server-status.bat
```

### **Manual Start:**
```bash
simple-monitor.bat
```

## 🎯 **Kết quả mong đợi**

### **Sau khi restart máy:**
1. **Windows boots** → Auto-start script chạy tự động
2. **45 giây sau** → API server khởi động
3. **Mở browser** → Truy cập `http://127.0.0.1:5507/frontend/index.html`
4. **Website hoạt động** → Không lỗi `ERR_CONNECTION_REFUSED` hay CORS

### **Nếu có vấn đề:**
- Monitor sẽ tự động restart server
- Infinite restart protection đảm bảo không bao giờ dừng
- CORS được verify và fix tự động

## 📊 **Monitoring**

### **Logs Location:**
- Monitor window sẽ hiển thị real-time logs
- Health checks mỗi 30 giây
- CORS verification results

### **Status Indicators:**
- ✅ Server is healthy
- ✅ CORS is working  
- ❌ Server health check failed
- ⚠️ CORS issue detected

## 🛠️ **Troubleshooting**

### **Nếu auto-start không hoạt động:**
1. Check Windows Startup folder có shortcut không
2. Verify Node.js trong system PATH
3. Run `test-auto-start.bat` để debug

### **Nếu website vẫn lỗi:**
1. Run `check-server-status.bat`
2. Kiểm tra Live Server có chạy không
3. Verify port 3001 và 5507

## 🏆 **Đảm bảo**

✅ **API tự động khởi động** khi boot
✅ **Không lỗi connection** khi mở website  
✅ **CORS hoạt động** đúng
✅ **Auto-restart** khi có vấn đề
✅ **Infinite protection** - không bao giờ dừng
✅ **Fast recovery** - khôi phục nhanh

**🎯 Bây giờ bạn có thể restart máy tính và mở website mà không lo lắng về lỗi API!**
