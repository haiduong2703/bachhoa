# User Management & Change Password API Testing

## 🔐 Change Password (User)

### Test với Postman/Thunder Client:

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

**Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Responses:**

- `400`: Current password incorrect
- `400`: New password must be different from current
- `400`: Password confirmation does not match
- `400`: Password validation failed (min 6 chars, uppercase, lowercase, number)
- `401`: Unauthorized (no token or invalid token)

---

## 👥 User Management (Admin Only)

### 1. Get All Users

**Endpoint:** `GET /api/users?page=1&limit=10&status=active&role=customer&search=john`

**Headers:**

```json
{
  "Authorization": "Bearer ADMIN_TOKEN"
}
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): active | inactive | banned
- `role` (optional): admin | customer | manager
- `search` (optional): Search by name or email

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+84123456789",
        "avatar": "/uploads/users/1/avatar.jpg",
        "status": "active",
        "emailVerified": true,
        "lastLogin": "2025-10-29T10:30:00.000Z",
        "roles": [{ "id": 2, "name": "customer" }]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+84123456789",
      "avatar": "/uploads/users/1/avatar.jpg",
      "status": "active",
      "roles": [...]
    }
  }
}
```

---

### 3. Update User

**Endpoint:** `PUT /api/users/:id`

**Body:**

```json
{
  "firstName": "John Updated",
  "lastName": "Doe",
  "phone": "+84987654321",
  "status": "active",
  "roleIds": [2, 3]
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 4. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Success Response (200):**

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Error:**

- `403`: Cannot delete your own account

---

### 5. Reset User Password (Admin)

**Endpoint:** `POST /api/users/:id/reset-password`

**Body:**

```json
{
  "newPassword": "TempPass123"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

### 6. Get User Statistics

**Endpoint:** `GET /api/users/stats`

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 25,
    "bannedUsers": 5,
    "usersByRole": [
      { "id": 1, "name": "admin", "userCount": 5 },
      { "id": 2, "name": "customer", "userCount": 140 },
      { "id": 3, "name": "manager", "userCount": 5 }
    ]
  }
}
```

---

## 📷 Avatar Upload

### 7. Upload Avatar (Any authenticated user)

**Endpoint:** `POST /api/users/avatar`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data
```

**Body (Form-data):**

- `file`: Image file (jpg, png, jpeg, gif, webp - max 5MB)

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "/uploads/users/1/avatar-uuid-timestamp.jpg"
  }
}
```

---

### 8. Delete Avatar

**Endpoint:** `DELETE /api/users/avatar`

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Avatar deleted successfully"
}
```

---

## 🧪 Test Scenarios

### Scenario 1: User changes password

```bash
# Step 1: Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "OldPass123" }

# Step 2: Change password
PUT /api/auth/change-password
Headers: { "Authorization": "Bearer TOKEN" }
Body: {
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}

# Step 3: Login with new password
POST /api/auth/login
Body: { "email": "user@example.com", "password": "NewPass456" }
```

### Scenario 2: Admin manages users

```bash
# Get all users
GET /api/users?status=active

# Update user status
PUT /api/users/5
Body: { "status": "inactive" }

# Reset user password
POST /api/users/5/reset-password
Body: { "newPassword": "TempPass123" }
```

---

## ✅ Validation Rules

### Change Password:

- `currentPassword`: Required
- `newPassword`:
  - Min 6 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - Must be different from current password
- `confirmPassword`: Required, must match `newPassword`

### Avatar Upload:

- Allowed formats: jpg, jpeg, png, gif, webp
- Max file size: 5MB
- Auto resize and optimize

---

## 🔒 Authorization

- **Change Password**: Any authenticated user (own account only)
- **Upload/Delete Avatar**: Any authenticated user (own avatar only)
- **User Management**: Admin role only
- **User Stats**: Admin role only
