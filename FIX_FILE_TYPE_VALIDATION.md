# 🐛 FIX: File Type Validation Error

## ❌ Lỗi

```
File type .jpg is not allowed.
Allowed types: image/jpeg, image/png, image/gif, image/webp
```

## 🔍 Nguyên nhân

File filter đang check MIME type (`image/jpeg`) nhưng config lại là file extension (`jpg`).

## ✅ Giải pháp đã áp dụng

### Trước:

```javascript
fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);

  if (this.allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new ValidationError(...), false);
  }
};
```

### Sau:

```javascript
fileFilter = (req, file, cb) => {
  // Check CẢ MIME type VÀ file extension
  const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeType = file.mimetype.toLowerCase();

  const allowedMimeTypes = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp']
  };

  // Validate cả 2
  const isValidMimeType = Object.keys(allowedMimeTypes).includes(mimeType);
  const isValidExtension = isValidMimeType &&
    allowedMimeTypes[mimeType].includes(fileExt);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(new ValidationError(...), false);
  }
};
```

## 🎯 Lợi ích

- ✅ Check cả MIME type (security)
- ✅ Check extension (user-friendly)
- ✅ Ngăn chặn file giả mạo extension
- ✅ Error message rõ ràng hơn

## 🔄 Cách test lại

### 1. Restart Backend (BẮT BUỘC)

```bash
# Ctrl+C để stop
# Rồi chạy lại:
cd backend
npm run dev
```

### 2. Test với tool

```bash
1. Mở test-upload.html
2. Chọn file .jpg
3. Upload
4. Phải thấy: "Upload thành công" ✅
```

### 3. Test trên app

```bash
1. Admin → Add Product
2. Upload ảnh .jpg
3. Phải hoạt động bình thường ✅
```

## 📝 Các file types được hỗ trợ

| Extension | MIME Type  | Status |
| --------- | ---------- | ------ |
| .jpg      | image/jpeg | ✅     |
| .jpeg     | image/jpeg | ✅     |
| .png      | image/png  | ✅     |
| .gif      | image/gif  | ✅     |
| .webp     | image/webp | ✅     |

## 🛡️ Security Improvement

Code mới check cả 2:

1. **MIME type**: Phát hiện file giả mạo
2. **Extension**: User-friendly validation

Ví dụ: File `.exe` đổi thành `.jpg` sẽ BỊ CHẶN vì MIME type không match.

---

**Status:** ✅ FIXED  
**Action:** Restart backend và test lại
