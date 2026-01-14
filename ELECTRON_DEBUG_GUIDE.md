# 🔧 Hotel Admin Electron - Debug Guide

## 🎯 Vấn đề hiện tại
Ứng dụng Electron đang mở trang chủ website thay vì trang đăng nhập admin.

## 🔍 Cách kiểm tra

### 1. Mở Developer Tools
Khi ứng dụng chạy, nhấn **F12** hoặc **Ctrl+Shift+I** để mở DevTools.

### 2. Kiểm tra Console
Trong tab **Console**, bạn sẽ thấy các log messages:
```
Electron: Checking current location...
Current hash: #/
Current pathname: /index.html
```

### 3. Kiểm tra URL hiện tại
Trong Console, gõ:
```javascript
console.log('Current URL:', window.location.href);
console.log('Hash:', window.location.hash);
```

### 4. Force redirect thủ công
Nếu không tự động chuyển, gõ trong Console:
```javascript
window.location.hash = '#/login-admin';
```

## 🛠️ Các giải pháp đã thử

### ✅ Đã làm:
1. **Cấu hình Electron main.js** - Force load với hash route
2. **Thêm logic trong App.vue** - Detect Electron và redirect
3. **Cập nhật Vue Router** - Support hash history cho Electron
4. **Build với electron-packager** - Tránh lỗi code signing

### 🔄 Đang test:
- Load file với hash parameter: `loadFile(indexPath, { hash: '/login-admin' })`
- Backup JavaScript redirect sau 2 giây
- Console logging để debug

## 📋 Checklist Debug

### Khi mở app, kiểm tra:
- [ ] App có mở được không?
- [ ] DevTools có hiển thị không? (F12)
- [ ] Console có log messages không?
- [ ] URL hiện tại là gì?
- [ ] Hash routing có hoạt động không?

### Nếu vẫn ở trang chủ:
1. **Mở Console** (F12)
2. **Gõ lệnh**: `window.location.hash = '#/login-admin'`
3. **Enter** để force redirect
4. **Kiểm tra** có chuyển trang không

## 🎯 Mục tiêu
Ứng dụng phải:
1. **Khởi động** → Tự động mở trang `/login-admin`
2. **Đăng nhập thành công** → Chuyển đến `/admin`
3. **Không hiển thị** header/footer website
4. **Chỉ có** LoginAdmin.vue và AdminView.vue

## 🚀 Commands hữu ích

```bash
# Build lại app
npm run electron:pack:win

# Chạy development mode
npm run electron:dev

# Kill tất cả processes
taskkill /f /im hotel-admin.exe

# Test app
Start-Process "d:\laragon\www\hotel\dist-packaged\hotel-admin-win32-x64\hotel-admin.exe"
```

## 📱 Test thủ công

Sau khi mở app:
1. **F12** → Mở DevTools
2. **Console tab** → Xem logs
3. **Gõ**: `window.location.hash = '#/login-admin'`
4. **Kiểm tra** trang đăng nhập có hiện không

---

**💡 Tip**: Nếu app vẫn không hoạt động đúng, có thể cần tạo một version Electron riêng biệt chỉ dành cho admin, không dùng chung codebase với website.
