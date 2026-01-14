# 🏨 Hotel Admin Panel - Desktop App

Ứng dụng desktop cho trang quản trị khách sạn đã được build thành công!

## 📁 Cấu trúc thư mục

```
hotel/
├── dist-electron-new/
│   └── win-unpacked/
│       └── Hotel Admin Panel.exe  ← Ứng dụng đã build
├── electron/
│   ├── main.js                    ← Main process
│   └── preload.js                 ← Preload script
├── src/
│   └── views/
│       └── AdminView.vue          ← Admin panel
└── run-admin-app.bat              ← Script chạy ứng dụng
```

## 🚀 Cách sử dụng

### Chạy ứng dụng:
1. **Double-click** vào file `run-admin-app.bat`
2. Hoặc **double-click** trực tiếp vào `dist-electron\win-unpacked\Hotel Admin Panel.exe`

### Chạy từ command line:
```bash
# Từ thư mục gốc
.\run-admin-app.bat

# Hoặc trực tiếp
.\dist-electron-new\win-unpacked\Hotel Admin Panel.exe
```

## ✨ Tính năng

- ✅ **Dashboard** - Thống kê tổng quan
- ✅ **Quản lý thể loại phòng** - CRUD operations
- ✅ **Quản lý phòng** - Thêm, sửa, xóa phòng
- ✅ **Quản lý đặt phòng** - Xem và cập nhật trạng thái
- ✅ **Quản lý người dùng** - Kích hoạt/vô hiệu hóa
- ✅ **Modern UI/UX** - Giao diện đẹp và responsive
- ✅ **Desktop App** - Chạy độc lập, không cần browser

## 🔧 Yêu cầu hệ thống

- **OS**: Windows 10/11
- **RAM**: 4GB+
- **Disk**: 500MB free space
- **Backend**: Laravel API server (http://127.0.0.1:4953)

## 📋 Hướng dẫn cài đặt

1. **Đảm bảo backend đang chạy**:
   ```bash
   cd ../hotelBE
   php artisan serve
   ```

2. **Chạy ứng dụng admin**:
   ```bash
   # Từ thư mục hotel
   .\run-admin-app.bat
   ```

## 🛠️ Development

### Chạy trong development mode:
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron:dev
```

### Build lại ứng dụng:
```bash
# Build cho Windows
npm run electron:build:win

# Build cho tất cả platforms
npm run electron:build
```

## 🔒 Bảo mật

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Web security enabled
- ✅ Preload script for secure API access

## 📝 Ghi chú

- Ứng dụng sẽ tự động mở trang admin (`/admin`)
- Cần đảm bảo backend API đang chạy để có dữ liệu
- Có thể chạy offline nhưng sẽ không có dữ liệu thực

## 🎉 Hoàn thành!

Ứng dụng desktop cho trang admin đã được build thành công và sẵn sàng sử dụng!
