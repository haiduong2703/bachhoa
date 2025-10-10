# 🔧 Fix Category Image Upload - Lưu vào Đúng Folder

## ❌ Vấn Đề:
1. **Category images lưu vào folder `products` thay vì `categories`**
2. **Nhiều ảnh duplicate với kích thước khác nhau**

## ✅ Giải Pháp:

### 1. **Về Duplicate Images (KHÔNG PHẢI LỖI)**
```
products/
  abc123-thumbnail.jpg    ← 150x150px (mobile thumbnails)
  abc123-small.jpg        ← 300x300px (small screens)
  abc123-medium.jpg       ← 600x600px (tablets)
  abc123-large.jpg        ← 1200x1200px (desktop HD)
```

- Đây là **TÍNH NĂNG** cho responsive images
- Mỗi ảnh tạo 4 variants để tối ưu tải trang trên thiết bị khác nhau
- Browser sẽ chọn size phù hợp với màn hình

### 2. **Fix Category Upload**

#### A. Thêm method `uploadCategoryImage` vào `uploadService.js`:

```javascript
/**
 * Upload and process category image
 */
async uploadCategoryImage(file) {
  try {
    const tempDir = path.join(this.uploadPath, "categories"); // ← CATEGORIES FOLDER
    await fs.mkdir(tempDir, { recursive: true });

    const baseName = path.parse(file.filename).name;

    // Create variants (same as products)
    const variants = {};
    const sizes = {
      thumbnail: { width: 150, height: 150, quality: 70 },
      small: { width: 300, height: 300, quality: 75 },
      medium: { width: 600, height: 600, quality: 80 },
      large: { width: 1200, height: 1200, quality: 85 },
    };

    for (const [size, options] of Object.entries(sizes)) {
      const outputPath = path.join(tempDir, `${baseName}-${size}.jpg`);

      await this.processImage(file.path, outputPath, {
        width: options.width,
        height: options.height,
        quality: options.quality,
        format: "jpeg",
      });

      variants[size] = {
        path: outputPath,
        url: `/uploads/categories/${baseName}-${size}.jpg`, // ← CATEGORIES URL
      };
    }

    // Clean up original file
    await fs.unlink(file.path);

    return {
      original: file.originalname,
      variants,
      primary: variants.medium || variants.large,
      thumbnail: variants.thumbnail,
    };
  } catch (error) {
    console.error("Failed to process category image:", error);
    throw error;
  }
}
```

#### B. Cập nhật route `uploads.js` để xử lý type="category":

```javascript
const type = req.body.type || "product";
console.log(`📦 Upload type: ${type}`);
let result;

if (type === "product") {
  console.log("🔄 Processing product image...");
  result = await uploadService.uploadProductImage(req.file);
  // ... product handling code ...
  
} else if (type === "category") {  // ← THÊM PHẦN NÀY
  console.log("🔄 Processing category image...");
  result = await uploadService.uploadCategoryImage(req.file);
  console.log("✅ Image processed:", JSON.stringify(result, null, 2));

  // For category, just return the medium variant URL
  res.json({
    status: "success",
    message: "Category image uploaded successfully",
    data: {
      url: result.variants.medium.url,
      thumbnailUrl: result.variants.thumbnail.url,
      variants: result.variants,
    },
  });
}
```

## 📁 Kết Quả:

### Products:
```
uploads/products/
  product1-thumbnail.jpg
  product1-small.jpg
  product1-medium.jpg
  product1-large.jpg
```

### Categories:
```
uploads/categories/
  category1-thumbnail.jpg
  category1-small.jpg
  category1-medium.jpg
  category1-large.jpg
```

## 🧪 Test:

### 1. Upload Category Image:
```javascript
// Frontend (AdminCategories.jsx)
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'category'); // ← QUAN TRỌNG!

const response = await uploadAPI.uploadImage(formData);
// Returns: { url: '/uploads/categories/abc123-medium.jpg' }
```

### 2. Kiểm tra folder:
```bash
ls uploads/categories/    # Nên thấy 4 files mỗi ảnh
ls uploads/products/      # Product images riêng
```

## 🎯 Tóm Tắt:

✅ **Fixed**: Category images giờ lưu vào `uploads/categories/`  
✅ **Explained**: 4 variants mỗi ảnh là tính năng, không phải lỗi  
✅ **Added**: Method `uploadCategoryImage()` riêng cho categories  
✅ **Updated**: Route handler xử lý type="category"  

## ⚠️ Lưu Ý:

- **RESTART backend** sau khi sửa code: `npm run dev`
- Frontend đã đúng rồi (đã pass `type: 'category'`)
- Folder `uploads/categories/` sẽ tự tạo khi upload lần đầu
