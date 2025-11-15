# Sửa lỗi cập nhật thông tin User Profile

## Vấn đề

Người dùng không thể chỉnh sửa thông tin cá nhân (firstName, lastName, phone, address, dateOfBirth, gender) từ trang profile.

## Nguyên nhân

1. **Frontend**: Dòng `await updateProfile(formData)` bị comment out
2. **Backend**: Controller `updateProfile` chỉ xử lý 3 trường (firstName, lastName, phone)
3. **Database**: Thiếu các cột `address`, `date_of_birth`, `gender` trong bảng `users`
4. **Model**: User model không có định nghĩa cho 3 trường trên
5. **Validation**: Middleware validation không validate các trường mới

## Các thay đổi đã thực hiện

### 1. Database Migration

**File**: `backend/database/migrations/add-user-profile-fields.sql`

```sql
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other');
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);
```

**Script chạy migration**: `backend/database/run-user-profile-migration.js`

### 2. Backend - Model

**File**: `backend/src/models/User.js`

Thêm 3 trường mới:

```javascript
address: {
  type: DataTypes.TEXT,
  allowNull: true
},
dateOfBirth: {
  type: DataTypes.DATEONLY,
  allowNull: true,
  field: 'date_of_birth'
},
gender: {
  type: DataTypes.ENUM('male', 'female', 'other'),
  allowNull: true
}
```

### 3. Backend - Controller

**File**: `backend/src/controllers/authController.js`

Cập nhật hàm `updateProfile`:

```javascript
export const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, address, dateOfBirth, gender } = req.body;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
  if (gender !== undefined) updateData.gender = gender;

  await req.user.update(updateData);

  // Reload user with roles to get updated data
  await req.user.reload({
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: req.user.toJSON(),
    },
  });
});
```

### 4. Backend - Validation

**File**: `backend/src/middlewares/validation.js`

Thêm validation cho 3 trường mới:

```javascript
updateProfile: [
  body("firstName").optional().trim().isLength({ min: 1, max: 100 }),
  body("lastName").optional().trim().isLength({ min: 1, max: 100 }),
  body("phone")
    .optional()
    .matches(/^[+]?[\d\s\-()]+$/),
  body("address").optional().trim().isLength({ max: 500 }),
  body("dateOfBirth").optional().isISO8601(),
  body("gender").optional().isIn(["male", "female", "other"]),
  handleValidationErrors,
];
```

### 5. Frontend - Customer Profile

**File**: `frontend/src/pages/customer/CustomerProfile.jsx`

- Bỏ comment dòng `await updateProfile(formData)` → Gọi API thực sự
- Thêm error handling chi tiết hơn với `error.response?.data?.message`

```javascript
const handleSave = async () => {
  try {
    setIsLoading(true);
    await updateProfile(formData);
    toast.success("Cập nhật thông tin thành công");
    setIsEditing(false);
  } catch (error) {
    console.error("Update profile error:", error);
    toast.error(
      error.response?.data?.message || "Không thể cập nhật thông tin"
    );
  } finally {
    setIsLoading(false);
  }
};
```

### 6. Frontend - Staff Profile

**File**: `frontend/src/pages/staff/StaffProfile.jsx`

- Giống như Customer Profile, bỏ comment và thêm error handling

## Kết quả

✅ User có thể chỉnh sửa tất cả thông tin:

- Họ, tên
- Số điện thoại
- Địa chỉ
- Ngày sinh
- Giới tính

✅ Validation đầy đủ cho tất cả các trường
✅ Thông báo lỗi rõ ràng khi có vấn đề
✅ Database có đầy đủ các trường cần thiết với indexes

## Cách test

1. Đăng nhập với tài khoản customer hoặc staff
2. Vào trang Profile
3. Click nút "Chỉnh sửa"
4. Thay đổi các thông tin (họ, tên, phone, địa chỉ, ngày sinh, giới tính)
5. Click "Lưu"
6. Kiểm tra thông tin đã được cập nhật
7. Reload trang để xác nhận dữ liệu đã lưu vào database

## Migration Command

```bash
cd backend
node database/run-user-profile-migration.js
```
