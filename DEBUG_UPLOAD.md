# 🐛 DEBUG UPLOAD IMAGE - HƯỚNG DẪN CHI TIẾT

## ❌ Vấn đề hiện tại

- Khi thêm/update sản phẩm, `imageIds` là mảng rỗng `[]`
- Ảnh chưa được lưu vào thư mục `uploads/products`
- Backend chưa nhận được request upload

## ✅ Các thay đổi đã thực hiện

### 1. Backend

- ✅ Thêm method `uploadProductImage()` vào uploadService.js
- ✅ Thêm logging chi tiết trong routes/uploads.js
- ✅ Thư mục uploads/products đã tồn tại

### 2. Frontend

- ✅ Auto-upload ảnh khi submit form nếu có file chưa upload
- ✅ Validation: Yêu cầu ít nhất 1 ảnh
- ✅ Better error messages

## 🧪 CÁCH TEST

### Bước 1: Khởi động Backend với logging

```bash
cd c:\Users\Admin\Desktop\DoAnBachHoa\bachhoa\backend
npm run dev
```

**Quan sát:** Terminal sẽ hiển thị logs khi có request upload:

```
📸 Upload request received
File: { fieldname: 'file', originalname: '...', ... }
📦 Upload type: product
🔄 Processing product image...
✅ Image processed: { ... }
💾 Saved to database, ID: 123
```

### Bước 2: Khởi động Frontend

```bash
cd c:\Users\Admin\Desktop\DoAnBachHoa\bachhoa\frontend
npm run dev
```

### Bước 3: Test bằng Tool (RECOMMENDED)

#### Cách 1: Sử dụng test-upload.html

1. Mở file `test-upload.html` trong browser
2. Lấy token:
   - Đăng nhập vào app admin
   - Mở DevTools (F12) → Console
   - Gõ: `localStorage.getItem('auth-storage')`
   - Copy toàn bộ kết quả
3. Paste token vào ô "Token"
4. Chọn ảnh và click Upload
5. Xem log chi tiết

#### Cách 2: Test trực tiếp trên App

1. Đăng nhập Admin: http://localhost:3000/login

   - Email: `admin@bachhoa.com`
   - Password: `Admin123!`

2. Vào Admin → Products → Add Product

3. **Test Upload:**

   - Kéo thả hoặc click chọn ảnh
   - **QUAN TRỌNG:** Click nút "Tải lên X ảnh" (hoặc để auto-upload khi submit)
   - Kiểm tra:
     - ✅ Loading spinner hiển thị
     - ✅ Toast notification "Tải ảnh lên thành công"
     - ✅ Ảnh hiển thị ở "Ảnh hiện tại"
     - ✅ Backend log hiển thị request

4. **Điền form và Submit:**

   - Tên sản phẩm: "Test Product"
   - SKU: "TEST-001"
   - Giá: 10000
   - Số lượng: 100
   - Chọn ít nhất 1 danh mục
   - Click "Lưu sản phẩm"

5. **Kiểm tra kết quả:**
   - Terminal backend phải show logs
   - Database có record mới trong `product_images`
   - File ảnh có trong `backend/uploads/products/`

### Bước 4: Kiểm tra Database

```sql
-- Xem ảnh mới upload
SELECT * FROM product_images ORDER BY created_at DESC LIMIT 5;

-- Xem sản phẩm với ảnh
SELECT p.id, p.name, pi.image_url, pi.thumbnail_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
ORDER BY p.created_at DESC LIMIT 5;
```

### Bước 5: Kiểm tra File System

```bash
# PowerShell
cd c:\Users\Admin\Desktop\DoAnBachHoa\bachhoa\backend
Get-ChildItem uploads\products -Recurse | Select-Object Name, Length, LastWriteTime
```

## 🔍 TROUBLESHOOTING

### 1. Không thấy log "📸 Upload request received"

**Nguyên nhân:** Request upload chưa được gửi lên server

**Giải pháp:**

- Mở DevTools (F12) → Network tab
- Filter: "uploads"
- Thử upload lại
- Nếu không thấy request → Check frontend code
- Nếu thấy request nhưng bị lỗi → Check response

### 2. Lỗi "No file uploaded"

**Nguyên nhân:**

- Field name không đúng (phải là 'file')
- Content-Type không đúng
- File quá lớn (> 5MB)

**Giải pháp:**

```javascript
// Frontend phải gửi đúng format:
const formData = new FormData();
formData.append("file", file); // ← Phải là 'file'
formData.append("type", "product");
```

### 3. Lỗi "Unauthorized" hoặc 401

**Nguyên nhân:** Token hết hạn hoặc không hợp lệ

**Giải pháp:**

- Đăng xuất và đăng nhập lại
- Check token trong localStorage
- Đảm bảo header: `Authorization: Bearer <token>`

### 4. Upload thành công nhưng không thấy ảnh

**Nguyên nhân:**

- imageIds không được gửi đúng
- Backend không link ảnh với product

**Check:**

```javascript
// Frontend payload phải có:
{
  name: "...",
  imageIds: [123, 456],  // ← Phải có array không rỗng
  ...
}
```

### 5. Lỗi Sharp/Image processing

**Nguyên nhân:** Sharp module chưa được cài đặt hoặc lỗi

**Giải pháp:**

```bash
cd backend
npm install sharp --save
npm rebuild sharp
```

## 📊 Expected Behavior

### Upload Flow Đúng:

```
1. User chọn file
   → imageFiles state updated

2. Click "Tải lên" (hoặc Submit form)
   → Frontend: Call uploadAPI.uploadImage(file, 'product')

3. Backend nhận request
   → Log: "📸 Upload request received"
   → Log: "📦 Upload type: product"

4. Upload service xử lý
   → Log: "🔄 Processing product image..."
   → Sharp resize, create variants
   → Save files to uploads/products/
   → Log: "✅ Image processed"

5. Lưu vào database
   → CREATE product_images record
   → Log: "💾 Saved to database, ID: xxx"

6. Return response
   → { id, url, thumbnailUrl }

7. Frontend update state
   → formData.images push new image
   → Display preview

8. Submit form
   → imageIds: [xxx] (không rỗng)

9. Backend tạo product
   → Link images với product (UPDATE product_id)
```

## 🎯 Quick Check Commands

```bash
# 1. Check backend running
curl http://localhost:5000/health

# 2. Check uploads folder
ls backend/uploads/products

# 3. Check database
mysql -u root -proot123 bach_hoa -e "SELECT COUNT(*) FROM product_images;"

# 4. Test upload với curl (cần token)
curl -X POST http://localhost:5000/api/v1/uploads/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/image.jpg" \
  -F "type=product"
```

## 📝 Next Steps

Nếu vẫn không hoạt động:

1. ✅ Chạy test-upload.html để isolate vấn đề
2. ✅ Copy logs từ backend terminal
3. ✅ Copy Network request/response từ DevTools
4. ✅ Check database có record không
5. ✅ Check file system có file không

---

**Updated:** 2025-10-07  
**Status:** Đã fix uploadProductImage method, đã thêm auto-upload, đã thêm logging
