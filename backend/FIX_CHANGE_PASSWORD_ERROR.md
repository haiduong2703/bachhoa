## 🐛 Fix: Change Password API Error

### **Vấn đề:**

API đổi mật khẩu báo lỗi:

```
Error: Illegal arguments: string, undefined
```

### **Nguyên nhân:**

- Middleware `authenticate` load user với `attributes: { exclude: ['password'] }`
- Khi gọi `req.user.comparePassword(currentPassword)`, field `password` là `undefined`
- bcrypt.compare() nhận `undefined` → lỗi "Illegal arguments"

### **Giải pháp:**

Reload user từ database với đầy đủ fields (bao gồm password) trước khi compare:

**Before:**

```javascript
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // ❌ req.user không có password field
  if (!(await req.user.comparePassword(currentPassword))) {
    throw new ValidationError("Current password is incorrect");
  }

  await req.user.update({ password: newPassword });
  // ...
});
```

**After:**

```javascript
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // ✅ Reload user with password field
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // ✅ Now user has password field
  if (!(await user.comparePassword(currentPassword))) {
    throw new ValidationError("Current password is incorrect");
  }

  await user.update({ password: newPassword });
  // ...
});
```

### **Files changed:**

- ✅ `backend/src/controllers/authController.js`
  - Added import `Op` from sequelize (for resetPassword)
  - Fixed changePassword to reload user with password

### **Test:**

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test API
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123",
    "newPassword": "NewPass456",
    "confirmPassword": "NewPass456"
  }'
```

**Expected response:**

```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### **✅ Status: FIXED**
