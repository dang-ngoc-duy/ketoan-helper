# Hướng Dẫn Cài Đặt KeToan Helper

## Cách 1: Cài từ file .tar.gz (Khuyến nghị)

1. **Download file:** `ketoan-helper.tar.gz` (từ thư mục này)

2. **Giải nén:**
   ```bash
   tar xzf ketoan-helper.tar.gz -C ketoan-helper-extension
   ```
   
   Hoặc trên Windows: Dùng 7-Zip hoặc WinRAR để giải nén

3. **Cài vào Chrome:**
   - Mở Chrome
   - Gõ `chrome://extensions/` vào address bar
   - Bật **Developer mode** (góc trên bên phải)
   - Click **"Load unpacked"**
   - Chọn folder `ketoan-helper-extension` vừa giải nén
   - Xong! Icon 🧮 sẽ xuất hiện trên thanh toolbar

## Cách 2: Cài trực tiếp từ folder source

Nếu bạn đã có source code trong folder:

1. Mở Chrome → `chrome://extensions/`
2. Bật **Developer mode**
3. Click **"Load unpacked"**
4. Chọn folder `/root/.openclaw/workspace/projects/ketoan-helper`

## Sau Khi Cài

### ✅ Kiểm tra hoạt động:
- Click icon extension trên toolbar → Popup hiện ra
- Thử tính VAT: Nhập `1000000` → Chọn "+ VAT 10%" → Kết quả: 1,100,000
- Thử đọc số: Nhập `1250000` → Click "Chuyển đổi" → "Một triệu hai trăm năm mươi nghìn đồng chẵn"

### ⌨️ Cài phím tắt (tùy chọn):
1. Chrome → `chrome://extensions/shortcuts`
2. Tìm "KeToan Helper"
3. Cài phím tắt theo ý muốn:
   - Toggle calculator
   - Convert number to text
   - Open clipboard

### 🎯 Sử dụng context menu:
- Bôi đen BẤT KỲ SỐ NÀO trên trang web
- Chuột phải → **"Đọc số tiền bằng chữ"**
- Kết quả tự động copy vào clipboard!

## Gỡ Cài Đặt

1. Chrome → `chrome://extensions/`
2. Tìm "KeToan Helper"
3. Click **"Remove"**

## Cập Nhật Extension

Khi có phiên bản mới:
1. Gỡ phiên bản cũ (hoặc giữ nguyên)
2. Download file mới
3. Cài lại theo Cách 1 hoặc Cách 2

**Lưu ý:** Dữ liệu clipboard đã lưu sẽ KHÔNG mất khi cập nhật (lưu trong Chrome Storage)

## Khắc Phục Lỗi

### Extension không load được:
- Kiểm tra file `manifest.json` có trong folder không
- Kiểm tra Chrome version >= 88 (Manifest V3)

### Phím tắt không hoạt động:
- Vào `chrome://extensions/shortcuts` để cài lại
- Một số phím tắt có thể bị conflict với extension khác

### Context menu không xuất hiện:
- Reload extension: Click nút reload trên `chrome://extensions/`
- Restart Chrome

## Hỗ Trợ

Build by: **Bé Heo 🐷** - Justin's Corp
Version: 1.0.0
License: MIT
