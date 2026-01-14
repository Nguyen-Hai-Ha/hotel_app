# Hotel Admin Panel - Electron App

Ứng dụng desktop cho trang quản trị khách sạn được xây dựng bằng Electron.

## Cài đặt

```bash
npm install
```

## Development

### Chạy ứng dụng trong development mode:

1. Khởi động Vite dev server:
```bash
npm run dev
```

2. Trong terminal khác, chạy Electron:
```bash
npm run electron:dev
```

### Hoặc chạy cả hai cùng lúc:
```bash
npm run electron:dev
```

## Build

### Build cho Windows:
```bash
npm run electron:build:win
```

### Build cho macOS:
```bash
npm run electron:build:mac
```

### Build cho Linux:
```bash
npm run electron:build:linux
```

### Build cho tất cả platforms:
```bash
npm run electron:build
```

## Cấu trúc thư mục

```
hotel/
├── electron/
│   ├── main.js          # Main process
│   └── preload.js       # Preload script
├── src/
│   └── views/
│       └── AdminView.vue # Admin panel
├── dist/                # Built Vue app
└── dist-electron/       # Built Electron app
```

## Tính năng

- ✅ Dashboard với thống kê
- ✅ Quản lý thể loại phòng
- ✅ Quản lý phòng
- ✅ Quản lý đặt phòng
- ✅ Quản lý người dùng
- ✅ Responsive design
- ✅ Modern UI/UX

## Yêu cầu hệ thống

- Windows 10+ / macOS 10.14+ / Linux
- RAM: 4GB+
- Disk: 500MB free space

## Troubleshooting

### Lỗi build:
1. Đảm bảo đã cài đặt tất cả dependencies
2. Chạy `npm run build` trước khi build Electron
3. Kiểm tra Node.js version (>= 16)

### Lỗi runtime:
1. Kiểm tra backend API có đang chạy không
2. Kiểm tra CORS configuration
3. Xem console logs trong DevTools
