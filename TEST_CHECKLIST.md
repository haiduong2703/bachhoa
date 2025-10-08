# ✅ CHECKLIST TEST UPLOAD ẢNH

## 🚀 Bước 1: Chuẩn bị (1 phút)

- [ ] Backend đang chạy: `cd backend && npm run dev`
- [ ] Frontend đang chạy: `cd frontend && npm run dev`
- [ ] Database đã migrate (check: `thumbnail_url` column exists)

## 🧪 Bước 2: Test với Tool (5 phút)

- [ ] Mở `test-upload.html` trong browser
- [ ] Đăng nhập app → F12 → Console → Gõ: `localStorage.getItem('auth-storage')`
- [ ] Copy token vào tool
- [ ] Chọn 1-2 ảnh test
- [ ] Click "Upload"
- [ ] **Kiểm tra:**
  - [ ] Loading spinner hiển thị
  - [ ] Log hiện "Upload thành công"
  - [ ] Có ID và URL được return
  - [ ] Backend terminal hiện logs:
    ```
    📸 Upload request received
    📦 Upload type: product
    🔄 Processing product image...
    ✅ Image processed
    💾 Saved to database, ID: xxx
    ```
  - [ ] File có trong `backend/uploads/products/`
  - [ ] Database có record mới:
    ```sql
    SELECT * FROM product_images ORDER BY created_at DESC LIMIT 1;
    ```

## 🎯 Bước 3: Test trên App (5 phút)

- [ ] Đăng nhập Admin: `admin@bachhoa.com` / `Admin123!`
- [ ] Vào **Admin → Products → Add Product**
- [ ] **Upload ảnh:**
  - [ ] Kéo thả hoặc click chọn ảnh
  - [ ] Click "Tải lên X ảnh"
  - [ ] Toast hiện "Tải ảnh lên thành công"
  - [ ] Ảnh hiển thị ở "Ảnh hiện tại"
  - [ ] Backend logs hiển thị
- [ ] **Điền form:**
  - [ ] Tên: "Test Product Upload"
  - [ ] SKU: "TEST-UPLOAD-001"
  - [ ] Mô tả: "Testing upload feature" (TextArea đẹp với Ant Design)
  - [ ] Giá: 50000
  - [ ] Số lượng: 100
  - [ ] Chọn 1 danh mục
- [ ] **Submit:**
  - [ ] Click "Lưu sản phẩm"
  - [ ] Loading hiển thị
  - [ ] Redirect về danh sách sản phẩm
  - [ ] Toast "Thêm sản phẩm thành công"
  - [ ] Sản phẩm mới hiển thị với ảnh

## 🔍 Bước 4: Verify (2 phút)

### A. Check Database

```sql
-- Sản phẩm vừa tạo
SELECT * FROM products WHERE sku = 'TEST-UPLOAD-001';

-- Ảnh của sản phẩm
SELECT p.name, pi.image_url, pi.thumbnail_url, pi.is_primary
FROM products p
JOIN product_images pi ON p.id = pi.product_id
WHERE p.sku = 'TEST-UPLOAD-001';
```

- [ ] Product record tồn tại
- [ ] ProductImage records tồn tại
- [ ] `product_id` đã được link đúng
- [ ] `is_primary` = 1 cho ảnh đầu tiên

### B. Check File System

```bash
dir backend\uploads\products
```

- [ ] Có files: `xxxxx-thumbnail.jpg`, `xxxxx-medium.jpg`, etc.
- [ ] File size hợp lý (không phải 0 bytes)
- [ ] Timestamp là vừa mới

### C. Check Frontend Display

- [ ] Vào Product Detail page
- [ ] Ảnh hiển thị đúng
- [ ] Thumbnail load nhanh
- [ ] Click ảnh để xem full size

## 🎯 Bước 5: Test Update (3 phút)

- [ ] Edit sản phẩm vừa tạo
- [ ] Ảnh cũ hiển thị đúng
- [ ] Thêm ảnh mới
- [ ] Xóa 1 ảnh cũ (click X)
- [ ] Save
- [ ] Verify changes persist

## ✨ Bước 6: Test Auto-Upload (2 phút)

- [ ] Add Product mới
- [ ] Chọn ảnh NHƯNG KHÔNG CLICK "Tải lên"
- [ ] Điền form và submit luôn
- [ ] **Check:**
  - [ ] Message "Đang tải ảnh lên..."
  - [ ] Auto-upload xảy ra
  - [ ] Submit thành công
  - [ ] Ảnh được lưu đúng

## 🐛 Troubleshooting Quick Check

Nếu có lỗi, check theo thứ tự:

### 1. Backend không nhận request

- [ ] Check backend đang chạy: `http://localhost:5000/health`
- [ ] Check CORS settings
- [ ] Check token trong request header

### 2. Upload fails

- [ ] Check file size < 5MB
- [ ] Check file type (jpg, png, gif, webp)
- [ ] Check uploads folder permissions
- [ ] Check backend logs cho error details

### 3. ImageIds rỗng

- [ ] Check Network tab → uploads request thành công?
- [ ] Check response có `data.id` không?
- [ ] Check formData.images state có update không?

### 4. Database issues

- [ ] Check migration đã chạy: `SHOW COLUMNS FROM product_images;`
- [ ] Check connection string đúng không
- [ ] Check ProductImage model có field `thumbnailUrl`

## 📊 Success Criteria

Tất cả phải PASS:

- [x] Tool test upload thành công ✅
- [x] App upload thành công ✅
- [x] Files lưu vào uploads/products ✅
- [x] Database có records ✅
- [x] Images hiển thị đúng ✅
- [x] Auto-upload hoạt động ✅
- [x] Update product hoạt động ✅
- [x] Ant Design textarea đẹp ✅

## 🎉 Hoàn thành!

Nếu tất cả ✅ → **READY FOR PRODUCTION!** 🚀

Nếu có ❌ → Xem `DEBUG_UPLOAD.md` cho chi tiết
