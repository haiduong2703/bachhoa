# 🔐 Hướng Dẫn Chức Năng Đổi Mật Khẩu & Quản Lý User

## 📋 Tổng Quan

Đã hoàn thiện các chức năng:

### ✅ Đã có sẵn (được cải thiện):

1. **Đổi mật khẩu user** - `/api/auth/change-password`
2. **Quên mật khẩu** - `/api/auth/forgot-password`
3. **Reset mật khẩu** - `/api/auth/reset-password`

### 🆕 Mới thêm:

4. **Quản lý users (Admin)** - CRUD users
5. **Upload avatar** - Cho tất cả users
6. **Thống kê users** - Dành cho admin
7. **Reset password user (Admin)** - Admin reset password cho user bất kỳ

---

## 🎯 Chi Tiết Các Chức Năng

### 1️⃣ Đổi Mật Khẩu (User tự đổi)

**Endpoint:** `PUT /api/auth/change-password`

**Cải tiến:**

- ✅ Thêm validate `confirmPassword` (nhập lại mật khẩu mới)
- ✅ Kiểm tra mật khẩu mới phải khác mật khẩu cũ
- ✅ Validate mật khẩu mạnh: min 6 ký tự, có chữ hoa, chữ thường, số

**Request:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

**Validation Rules:**

- `currentPassword`: Required, phải đúng với mật khẩu hiện tại
- `newPassword`:
  - Min 6 ký tự
  - Có ít nhất 1 chữ HOA
  - Có ít nhất 1 chữ thường
  - Có ít nhất 1 số
  - **Phải khác mật khẩu cũ**
- `confirmPassword`: Required, phải trùng với `newPassword`

---

### 2️⃣ Quản Lý Users (Admin Only)

#### 📄 Danh sách users

```
GET /api/users
Query: ?page=1&limit=10&status=active&role=customer&search=john
```

#### 👤 Chi tiết user

```
GET /api/users/:id
```

#### ✏️ Cập nhật user

```
PUT /api/users/:id
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+84123456789",
  "status": "active",
  "roleIds": [2]
}
```

#### 🗑️ Xóa user

```
DELETE /api/users/:id
```

**Lưu ý:** Admin không thể xóa chính mình

#### 🔑 Reset password cho user (Admin)

```
POST /api/users/:id/reset-password
Body: { "newPassword": "TempPass123" }
```

Admin có thể reset password cho user bất kỳ (trừ chính mình nên dùng change-password)

#### 📊 Thống kê users

```
GET /api/users/stats
```

---

### 3️⃣ Upload Avatar

#### 📤 Upload avatar

```
POST /api/users/avatar
Content-Type: multipart/form-data
Body: file (image)
```

**Supported formats:** jpg, jpeg, png, gif, webp  
**Max size:** 5MB  
**Auto processing:** Resize & optimize ảnh

#### 🗑️ Xóa avatar

```
DELETE /api/users/avatar
```

---

## 🔒 Phân Quyền

| Chức năng            | Quyền truy cập                           |
| -------------------- | ---------------------------------------- |
| Change password      | ✅ User (chính mình)                     |
| Upload/Delete avatar | ✅ User (chính mình)                     |
| Get all users        | 🔐 Admin only                            |
| Get user by ID       | 🔐 Admin only                            |
| Update user          | 🔐 Admin only                            |
| Delete user          | 🔐 Admin only (không thể xóa chính mình) |
| Reset user password  | 🔐 Admin only                            |
| User statistics      | 🔐 Admin only                            |

---

## 📁 Files Đã Thay Đổi

### 🆕 Files mới:

```
backend/src/controllers/userController.js  - Controller quản lý users
backend/test-change-password.js            - Test script
USER_MANAGEMENT_API.md                     - API documentation
```

### ✏️ Files đã sửa:

```
backend/src/middlewares/validation.js      - Thêm validation cho confirmPassword
backend/src/routes/users.js                - Cập nhật routes đầy đủ
```

### ✅ Files không đổi (đã có sẵn):

```
backend/src/controllers/authController.js  - Đã có changePassword
backend/src/routes/auth.js                 - Đã có route change-password
backend/src/middlewares/auth.js            - Đã có authorize middleware
backend/src/models/User.js                 - Đã có password hashing
```

---

## 🧪 Cách Test

### Option 1: Dùng Test Script

```bash
cd backend
node test-change-password.js
```

### Option 2: Dùng Postman/Thunder Client

**Bước 1: Login để lấy token**

```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "OldPass123"
}
```

**Bước 2: Đổi mật khẩu**

```
PUT http://localhost:5000/api/auth/change-password
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: {
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

**Bước 3: Login với mật khẩu mới**

```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "test@example.com",
  "password": "NewPass456"
}
```

---

## 🎨 Frontend Integration (Gợi ý)

### Form đổi mật khẩu:

```jsx
// ChangePasswordForm.jsx
import { useState } from "react";

function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Current Password:</label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={(e) =>
            setFormData({ ...formData, currentPassword: e.target.value })
          }
          required
        />
      </div>

      <div>
        <label>New Password:</label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) =>
            setFormData({ ...formData, newPassword: e.target.value })
          }
          required
        />
        <small>Min 6 chars, 1 uppercase, 1 lowercase, 1 number</small>
      </div>

      <div>
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />
      </div>

      <button type="submit">Change Password</button>
    </form>
  );
}
```

---

## ⚠️ Lưu Ý Bảo Mật

1. **Rate Limiting:** Đã có trong `/api/auth/*` routes
2. **Password Hashing:** Dùng bcrypt với salt rounds = 12
3. **JWT Token:** Access token expire sau 15 phút, refresh token 7 ngày
4. **Validation:** Validate cả frontend và backend
5. **Error Messages:** Không tiết lộ thông tin nhạy cảm

---

## 🐛 Common Errors

| Status | Error                                | Nguyên nhân                            |
| ------ | ------------------------------------ | -------------------------------------- |
| 400    | Current password is incorrect        | Mật khẩu hiện tại sai                  |
| 400    | Password confirmation does not match | confirmPassword không khớp newPassword |
| 400    | New password must be different       | newPassword trùng currentPassword      |
| 400    | Password must contain...             | Mật khẩu yếu (thiếu chữ hoa/thường/số) |
| 401    | Unauthorized                         | Chưa login hoặc token hết hạn          |
| 403    | Insufficient permissions             | Không đủ quyền (cần admin role)        |

---

## 📝 TODO (Tùy chọn nâng cao)

- [ ] Password history (không cho dùng lại 5 mật khẩu gần nhất)
- [ ] Force password change (admin bắt user đổi password lần đầu login)
- [ ] Password expiry (tự động yêu cầu đổi sau 90 ngày)
- [ ] Two-factor authentication (2FA)
- [ ] Login attempt tracking (khóa account sau 5 lần sai)
- [ ] Email notification khi đổi password
- [ ] Password strength meter (frontend)

---

## ✅ Kết Luận

Chức năng đổi mật khẩu **đã hoàn thiện** với đầy đủ:

- ✅ Validation mạnh mẽ
- ✅ Bảo mật cao
- ✅ Quản lý users cho admin
- ✅ Upload avatar
- ✅ Test cases
- ✅ Documentation

**Ready for production!** 🚀
