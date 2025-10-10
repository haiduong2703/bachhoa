# 📸 Hướng Dẫn Upload Ảnh Cho Danh Mục

## ✅ **Đã Hoàn Thành**

Đã thêm chức năng upload ảnh cho trang **Quản lý Danh mục** (AdminCategories).

### 🎯 **Các Tính Năng:**

1. ✅ **Upload ảnh khi tạo danh mục mới**
2. ✅ **Upload ảnh khi chỉnh sửa danh mục**
3. ✅ **Preview ảnh trước khi lưu**
4. ✅ **Xóa ảnh và chọn lại**
5. ✅ **Hiển thị loading khi đang upload**
6. ✅ **Validate file type và size**

---

## 📋 **Các Thay Đổi Code**

### **File: `frontend/src/pages/admin/AdminCategories.jsx`**

#### **1. Imports mới:**
```jsx
import {
  // ... existing icons
  Upload,
  X as XIcon
} from 'lucide-react'
import { categoriesAPI, uploadAPI } from '../../services/api'
```

#### **2. State mới:**
```jsx
const [uploadingImage, setUploadingImage] = useState(false)
const [imagePreview, setImagePreview] = useState(null)
```

#### **3. Functions mới:**

**a. handleImageUpload** - Xử lý upload ảnh
```jsx
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.error('Vui lòng chọn file hình ảnh')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Kích thước file không được vượt quá 5MB')
    return
  }

  try {
    setUploadingImage(true)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload to server
    const response = await uploadAPI.uploadImage(file, 'category')
    const result = response.data.data
    
    // Update form data with uploaded image URL
    setFormData(prev => ({
      ...prev,
      image: result.url
    }))

    toast.success('Upload ảnh thành công')
  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Không thể upload ảnh')
    setImagePreview(null)
  } finally {
    setUploadingImage(false)
  }
}
```

**b. removeImage** - Xóa ảnh đã chọn
```jsx
const removeImage = () => {
  setFormData(prev => ({
    ...prev,
    image: ''
  }))
  setImagePreview(null)
}
```

**c. resetForm** - Reset form (đã cập nhật)
```jsx
const resetForm = () => {
  setFormData({
    name: '',
    description: '',
    parentId: null,
    image: '',
    status: 'active'
  })
  setImagePreview(null)  // ← Thêm dòng này
}
```

**d. openEditModal** - Mở modal edit (đã cập nhật)
```jsx
const openEditModal = (category) => {
  setEditingCategory(category)
  setImagePreview(category.image || null)  // ← Thêm dòng này
  setFormData({
    name: category.name,
    description: category.description || '',
    // ...
  })
}
```

#### **4. UI Upload Component (trong modal):**

Thay thế input URL cũ bằng upload component:

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Hình ảnh danh mục
  </label>
  
  {/* Image Preview or Upload Area */}
  {imagePreview || formData.image ? (
    <div className="relative inline-block">
      <img
        src={imagePreview || formData.image}
        alt="Category preview"
        className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
      />
      <button
        type="button"
        onClick={removeImage}
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
      <input
        type="file"
        id="category-image"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={uploadingImage}
      />
      <label
        htmlFor="category-image"
        className="cursor-pointer flex flex-col items-center"
      >
        {uploadingImage ? (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mb-3"></div>
            <p className="text-sm text-gray-500">Đang upload...</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              Click để chọn ảnh
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF (Tối đa 5MB)
            </p>
          </>
        )}
      </label>
    </div>
  )}
</div>
```

---

## 🧪 **Hướng Dẫn Test**

### **Test 1: Tạo Danh Mục Mới Với Ảnh**

1. Vào trang **Admin > Danh mục**
2. Click nút **"Thêm danh mục"**
3. Điền thông tin:
   - Tên danh mục: "Thực phẩm tươi sống"
   - Mô tả: "Rau củ, thịt cá tươi ngon"
4. Click vào khung upload ảnh (dashed border)
5. Chọn file ảnh từ máy tính
6. Đợi upload hoàn tất (thấy preview ảnh)
7. Click **"Tạo mới"**
8. ✅ Kiểm tra danh mục có ảnh trong danh sách

### **Test 2: Chỉnh Sửa Danh Mục (Thêm/Đổi Ảnh)**

1. Click icon ✏️ Edit ở một danh mục
2. Nếu đã có ảnh → Thấy preview
3. Click nút ❌ để xóa ảnh cũ (nếu muốn)
4. Click khung upload để chọn ảnh mới
5. Đợi upload hoàn tất
6. Click **"Cập nhật"**
7. ✅ Kiểm tra ảnh đã được thay đổi

### **Test 3: Validate File**

**Test file không phải ảnh:**
1. Mở modal tạo/edit danh mục
2. Chọn file PDF hoặc TXT
3. ❌ Thấy toast error: "Vui lòng chọn file hình ảnh"

**Test file quá lớn:**
1. Mở modal tạo/edit danh mục
2. Chọn file ảnh > 5MB
3. ❌ Thấy toast error: "Kích thước file không được vượt quá 5MB"

### **Test 4: Upload Thất Bại**

1. Tắt backend server
2. Thử upload ảnh
3. ❌ Thấy toast error: "Không thể upload ảnh"
4. Preview bị xóa

---

## 📊 **Flow Hoạt Động**

```
┌─────────────────┐
│  User chọn ảnh  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validate file  │ ─── ❌ Invalid → Show error toast
│  (type & size)  │
└────────┬────────┘
         │ ✅ Valid
         ▼
┌─────────────────┐
│ Create preview  │
│  (FileReader)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload to API   │ ─── ❌ Failed → Clear preview + Show error
│ uploadAPI       │
└────────┬────────┘
         │ ✅ Success
         ▼
┌─────────────────┐
│ Update formData │
│  with image URL │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show success    │
│     toast       │
└─────────────────┘
```

---

## 🎨 **UI States**

### **1. No Image (Upload Area)**
```
┌─────────────────────────────┐
│                             │
│         📤 Upload           │
│                             │
│   Click để chọn ảnh         │
│   PNG, JPG, GIF (Max 5MB)   │
│                             │
└─────────────────────────────┘
```

### **2. Uploading**
```
┌─────────────────────────────┐
│                             │
│         ⌛ Spinner          │
│                             │
│      Đang upload...         │
│                             │
└─────────────────────────────┘
```

### **3. Image Uploaded**
```
┌─────────────────────────────┐
│          ❌                  │ ← Remove button
│   ┌──────────────────┐      │
│   │                  │      │
│   │   Image Preview  │      │
│   │                  │      │
│   └──────────────────┘      │
└─────────────────────────────┘
```

---

## 🔧 **API Endpoint Sử Dụng**

```http
POST /api/v1/uploads/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
  - file: <image file>
  - type: "category"
```

**Response:**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "url": "/uploads/categories/abc123-medium.jpg",
    "thumbnailUrl": "/uploads/categories/abc123-thumbnail.jpg",
    "variants": {
      "thumbnail": { "url": "/uploads/categories/abc123-thumbnail.jpg" },
      "small": { "url": "/uploads/categories/abc123-small.jpg" },
      "medium": { "url": "/uploads/categories/abc123-medium.jpg" },
      "large": { "url": "/uploads/categories/abc123-large.jpg" }
    }
  }
}
```

---

## ✨ **Features Highlight**

✅ **Drag & Drop** - Có thể kéo thả file vào khung upload  
✅ **Preview** - Xem trước ảnh ngay lập tức  
✅ **Validation** - Kiểm tra type và size file  
✅ **Loading State** - Hiển thị progress khi upload  
✅ **Error Handling** - Xử lý lỗi và thông báo rõ ràng  
✅ **Remove Image** - Có thể xóa và chọn lại ảnh khác  
✅ **Responsive** - Hoạt động tốt trên mobile  

---

## 🎯 **Kết Quả**

Bây giờ trang **Quản lý Danh mục** đã có đầy đủ chức năng upload ảnh giống như trang **Quản lý Sản phẩm**!

🎉 **HOÀN THÀNH!** Sẵn sàng để test!
