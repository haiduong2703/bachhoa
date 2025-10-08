# Hướng dẫn kiểm tra upload ảnh sản phẩm

## Các thay đổi đã thực hiện

### Backend

1. ✅ **Upload Routes** (`backend/src/routes/uploads.js`):

   - Implement endpoint POST `/api/v1/uploads/image` - Upload 1 ảnh
   - Implement endpoint POST `/api/v1/uploads/images` - Upload nhiều ảnh
   - Implement endpoint DELETE `/api/v1/uploads/image` - Xóa ảnh
   - Sử dụng middleware authenticate để bảo mật

2. ✅ **Product Controller** (`backend/src/controllers/productController.js`):

   - Thêm xử lý `imageIds` trong `createProduct`
   - Thêm xử lý `imageIds` trong `updateProduct`
   - Tự động set ảnh đầu tiên làm primary image

3. ✅ **Product Image Model** (`backend/src/models/index.js`):

   - Thêm trường `thumbnailUrl` để lưu URL ảnh thumbnail
   - Cho phép `productId` nullable để upload ảnh trước khi gán sản phẩm

4. ✅ **Database Schema** (`backend/database/init.sql`):

   - Cập nhật bảng `product_images` thêm cột `thumbnail_url`
   - Cho phép `product_id` NULL

5. ✅ **Migration Script**:
   - Tạo file migration để update database hiện tại
   - File: `backend/database/migrations/add-thumbnail-url-to-product-images.sql`

### Frontend

1. ✅ **Ant Design Integration**:

   - Cài đặt package `antd`
   - Import CSS trong `main.jsx`
   - Sử dụng `TextArea` component cho mô tả sản phẩm

2. ✅ **Admin Product Form** (`frontend/src/pages/admin/AdminProductForm.jsx`):
   - Cải thiện UI với Ant Design TextArea
   - Thêm thuộc tính: autoSize, showCount, maxLength
   - Tăng cường error handling cho upload

## Cách test

### 1. Chạy migration database

```bash
# Sử dụng Docker
docker exec -i bach_hoa_db mysql -uroot -proot123 bach_hoa < backend/database/migrations/add-thumbnail-url-to-product-images.sql

# Hoặc sử dụng MySQL CLI
mysql -u root -p bach_hoa < backend/database/migrations/add-thumbnail-url-to-product-images.sql
```

### 2. Khởi động server

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 3. Test upload ảnh

1. **Đăng nhập với tài khoản Admin**:

   - Email: admin@bachhoa.com
   - Password: Admin123!

2. **Vào trang quản lý sản phẩm**:

   - Menu: Admin → Products → Add Product

3. **Test upload ảnh**:

   - Kéo và thả ảnh vào khung upload
   - Hoặc click để chọn file
   - Click "Tải lên X ảnh"
   - Kiểm tra ảnh hiển thị ở phần "Ảnh hiện tại"

4. **Test tạo sản phẩm mới**:

   - Điền đầy đủ thông tin
   - Upload ít nhất 1 ảnh
   - Click "Lưu sản phẩm"
   - Kiểm tra sản phẩm được tạo thành công

5. **Test chỉnh sửa sản phẩm**:
   - Vào Edit một sản phẩm đã có
   - Thêm/xóa ảnh
   - Click "Lưu thay đổi"
   - Kiểm tra ảnh được cập nhật

### 4. Kiểm tra trong database

```sql
-- Xem các ảnh đã upload
SELECT * FROM product_images ORDER BY created_at DESC LIMIT 10;

-- Xem sản phẩm với ảnh
SELECT p.id, p.name, pi.image_url, pi.thumbnail_url, pi.is_primary
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.created_at DESC LIMIT 10;
```

## Các điểm cần lưu ý

1. **Upload Folder**: Đảm bảo thư mục `backend/uploads/products` có quyền write
2. **File Size**: Giới hạn 5MB mỗi file (có thể thay đổi trong `uploadService.js`)
3. **File Types**: Chỉ chấp nhận: jpg, jpeg, png, gif, webp
4. **Authentication**: Cần đăng nhập mới upload được ảnh

## Troubleshooting

### Lỗi "No file uploaded"

- Kiểm tra field name trong form phải là `file` hoặc `files`
- Kiểm tra Content-Type phải là `multipart/form-data`

### Lỗi "File type not allowed"

- Kiểm tra định dạng file (chỉ chấp nhận jpg, jpeg, png, gif, webp)

### Lỗi upload nhưng không thấy ảnh

- Kiểm tra database xem record có được tạo không
- Kiểm tra đường dẫn file trong `backend/uploads/products`
- Kiểm tra endpoint `/uploads` có serve static files không

### Textarea không hiển thị đúng

- Xóa cache browser (Ctrl+Shift+R)
- Kiểm tra console có lỗi CSS không
- Đảm bảo antd CSS đã được import trong `main.jsx`

## API Endpoints

```
POST /api/v1/uploads/image
- Body: multipart/form-data
- Fields:
  - file: File object
  - type: 'product' (optional)
- Response: { id, url, thumbnailUrl }

POST /api/v1/uploads/images
- Body: multipart/form-data
- Fields:
  - files: Array of File objects
  - type: 'product' (optional)
- Response: { images: [{ id, url, thumbnailUrl }] }

DELETE /api/v1/uploads/image
- Body: { imagePath, imageId }
- Response: { status: 'success' }
```
