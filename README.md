# KeToan Helper - Trợ lý Kế Toán Chrome Extension

Extension Chrome giúp công việc kế toán hàng ngày nhanh hơn và chính xác hơn.

## Tính năng

### 🧮 VAT Calculator
- Tính nhanh thuế VAT 8% hoặc 10%
- Tách thuế từ tổng tiền
- Copy kết quả một click

### 🔢 Đọc Số Tiền Bằng Chữ
- Chuyển đổi số tiền thành chữ tiếng Việt
- Bôi đen số → Chuột phải → "Đọc số tiền bằng chữ"
- Tự động copy vào clipboard

### 📋 Multi-Clipboard
- Lưu các thông tin công ty thường dùng (MST, tên công ty, STK...)
- Lịch sử copy tự động (giữ 20 mục gần nhất)
- Click để copy lại

## Phím tắt

- `Ctrl + Shift + C` - Mở VAT Calculator
- `Ctrl + Shift + T` - Đọc số tiền đang bôi đen
- `Ctrl + Shift + V` - Mở Multi-Clipboard

(Mac: thay `Ctrl` bằng `Command`)

## Cài đặt

### Cách 1: Load unpacked (Developer mode)
1. Mở Chrome → `chrome://extensions/`
2. Bật "Developer mode" (góc trên bên phải)
3. Click "Load unpacked"
4. Chọn folder này

### Cách 2: Cài từ file .zip (đang build)
1. Download file `ketoan-helper.zip`
2. Giải nén
3. Làm theo Cách 1

## Hướng dẫn sử dụng

### VAT Calculator
1. Click icon extension trên thanh toolbar
2. Nhập số tiền vào ô "Nhập số tiền"
3. Chọn loại VAT (cộng hoặc tách)
4. Kết quả hiện ngay, click "Copy kết quả" để copy

### Đọc Số Tiền
**Cách 1:** Trong popup extension
1. Nhập số tiền
2. Click "Chuyển đổi"
3. Click "Copy"

**Cách 2:** Bôi đen số trên trang web bất kỳ
1. Bôi đen số tiền (ví dụ: 1250000)
2. Chuột phải → "Đọc số tiền bằng chữ"
3. Đã tự động copy: "Một triệu hai trăm năm mươi nghìn đồng chẵn"

### Multi-Clipboard
**Lưu dữ liệu cố định:**
1. Mở tab "Dữ liệu cố định"
2. Click "+ Thêm mới"
3. Nhập tên (ví dụ: "MST công ty") và nội dung
4. Click để copy lại bất cứ lúc nào

**Lịch sử copy:**
- Extension tự động lưu các số bạn copy (MST, số HĐ, số tiền...)
- Mở tab "Lịch sử" để xem và copy lại

## Build từ source

```bash
cd /root/.openclaw/workspace/projects/ketoan-helper
# Đã có đầy đủ file, chỉ cần zip lại
zip -r ketoan-helper.zip . -x "*.git*" -x "README.md" -x "icons/generate*"
```

## Tech Stack
- Manifest V3
- Vanilla JS (không dependencies)
- Chrome Extension APIs: storage, contextMenus, commands, clipboardWrite

## License
MIT - Build by Bé Heo 🐷 for Justin's Corp
