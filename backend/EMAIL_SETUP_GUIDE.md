# 📧 Hướng Dẫn Cấu Hình Email Service

## 🚫 Vấn Đề Hiện Tại

Lỗi: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Nguyên nhân:** Thông tin xác thực Gmail không đúng hoặc chưa được cấu hình.

---

## ✅ Giải Pháp Tạm Thời: TẮT EMAIL SERVICE

Đã thêm `SMTP_ENABLED=false` vào file `.env`:

```env
# Email Configuration (Gmail)
SMTP_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Bach Hoa Store
```

**Kết quả:**
- ✅ Backend chạy bình thường
- ✅ Không có lỗi email
- ⚠️ Các tính năng email sẽ bị tắt:
  - Xác thực email đăng ký
  - Quên mật khẩu
  - Thông báo đơn hàng

---

## 🔧 Cách Bật Lại Email Service (Khi Cần)

### Bước 1: Tạo App Password cho Gmail

1. Truy cập [Google Account Security](https://myaccount.google.com/security)
2. Bật **2-Step Verification** (nếu chưa bật)
3. Vào **App passwords** (Mật khẩu ứng dụng)
4. Chọn **Mail** và **Other** (đặt tên: Bach Hoa Store)
5. Copy mật khẩu 16 ký tự (ví dụ: `abcd efgh ijkl mnop`)

### Bước 2: Cập Nhật File .env

```env
# Email Configuration (Gmail)
SMTP_ENABLED=true                          # ← Đổi thành true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-real-email@gmail.com        # ← Email Gmail thực
SMTP_PASS=abcd efgh ijkl mnop              # ← App password vừa tạo (16 ký tự)
SMTP_FROM_NAME=Bach Hoa Store
```

### Bước 3: Restart Backend

```bash
# Dừng server (Ctrl+C)
npm run dev
```

---

## 🧪 Test Email Service

Sau khi cấu hình xong, test bằng cách:

### Test 1: Đăng ký tài khoản mới
```bash
POST http://localhost:5000/api/v1/auth/register
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```
→ Kiểm tra email nhận được link xác thực

### Test 2: Quên mật khẩu
```bash
POST http://localhost:5000/api/v1/auth/forgot-password
{
  "email": "test@example.com"
}
```
→ Kiểm tra email nhận được link reset password

---

## 📝 Lưu Ý Bảo Mật

1. **KHÔNG commit file .env** lên Git
   - File `.env` đã có trong `.gitignore`
   
2. **Sử dụng App Password**, KHÔNG dùng mật khẩu Gmail chính
   
3. **Production**: Nên dùng email service chuyên nghiệp như:
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark

---

## 🔍 Troubleshooting

### Lỗi: "Invalid login"
- ✅ Đảm bảo đã bật 2-Step Verification
- ✅ Sử dụng App Password, không phải mật khẩu Gmail
- ✅ Không có khoảng trắng trong App Password

### Lỗi: "Connection timeout"
- ✅ Kiểm tra firewall/antivirus
- ✅ Thử đổi port 587 → 465 và thêm `SMTP_SECURE=true`

### Lỗi: "Self signed certificate"
```env
NODE_TLS_REJECT_UNAUTHORIZED=0  # Chỉ dùng trong development
```

---

## 📊 Log Messages

Khi email service **disabled**:
```
📧 Email service is disabled
📧 Email would be sent to user@example.com: Welcome Email (Email service disabled)
```

Khi email service **enabled**:
```
✅ Email service initialized successfully
✅ Email sent to user@example.com: Welcome Email
```

---

## 🎯 Kết Luận

**Hiện tại:** Email service đã được tắt để backend chạy ổn định.

**Khi cần bật lại:** Làm theo 3 bước trên để cấu hình Gmail App Password.

**Khuyến nghị:** Sử dụng email service chuyên nghiệp khi deploy production.
