# Hướng Dẫn Auto-Update cho Hotel Admin App

## Yêu cầu

1. **GitHub Repository** - public hoặc private đều được
2. **GitHub Personal Access Token** (nếu repo private)

---

## Cách Sử Dụng

### Bước 1: Cấu hình GitHub Repository

Mở file `package.json` và thay thế thông tin GitHub:

```json
"publish": {
  "provider": "github",
  "owner": "Nguyen-Hai-Ha",  // Thay bằng username GitHub của bạn
  "repo": "hotel_app"               // Thay bằng tên repo
}
```

### Bước 2: Tạo GitHub Personal Access Token (nếu repo private)

1. Truy cập: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Chọn quyền: `repo` (full control)
4. Copy token

Tạo file `.env` trong thư mục gốc:
```
GH_TOKEN=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
```

### Bước 3: Tăng Version

Trước mỗi lần release, tăng version trong `package.json`:

```json
"version": "1.0.1"  // Tăng từ 1.0.0 → 1.0.1
```

### Bước 4: Build và Publish

```bash
npm run electron:publish
```

Lệnh này sẽ:
- Build ứng dụng
- Tạo installer (.exe)
- Upload lên GitHub Releases

---

## Workflow Hàng Ngày

```
1. Sửa code
2. Tăng version trong package.json
3. Chạy: npm run electron:publish
4. Xong! App người dùng sẽ tự thông báo
```

---

## Người Dùng Cuối

Khi có bản cập nhật mới:
1. Mở app → Tự động kiểm tra cập nhật
2. Hiện thông báo "Có bản cập nhật mới!"
3. Click "Tải xuống" → Chờ download
4. Click "Khởi động lại ngay" → App tự cài và khởi động lại

---

## Troubleshooting

### Lỗi "Cannot upload"
- Kiểm tra GH_TOKEN đã đúng chưa
- Kiểm tra owner/repo trong package.json

### Không thấy update
- Đảm bảo version mới > version cũ
- Kiểm tra GitHub Releases đã có file upload chưa

### Test trên máy local
Không thể test auto-update trên dev mode. Cần:
1. Build bản v1.0.0, cài đặt
2. Build bản v1.0.1, upload lên GitHub
3. Mở app v1.0.0 sẽ thấy thông báo update
