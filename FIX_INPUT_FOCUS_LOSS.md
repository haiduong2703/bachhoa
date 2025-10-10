# 🔧 Fix Input Focus Loss in Category Modal

## ❌ **Vấn Đề:**

Khi nhập text vào input trong modal Thêm/Sửa danh mục:
- Gõ được **1 ký tự** → Input bị **mất focus** (out khỏi input)
- Phải **click lại** vào input để tiếp tục gõ
- Rất khó chịu và không thể nhập liên tục

---

## 🔍 **Nguyên Nhân:**

### **Component Re-creation on Every Render**

```jsx
const AdminCategories = () => {
  const [formData, setFormData] = useState({ name: '', ... })

  // ❌ PROBLEM: CategoryModal được define BÊN TRONG AdminCategories
  const CategoryModal = ({ isOpen, onClose }) => {
    return (
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
    )
  }

  return (
    <div>
      <CategoryModal isOpen={true} />
    </div>
  )
}
```

**Luồng xử lý SAI:**

1. User gõ "A" → `onChange` trigger
2. `setFormData({ name: 'A' })` → State thay đổi
3. `AdminCategories` **RE-RENDER** 
4. React thấy `CategoryModal` là **function mới** (khác reference)
5. React **UNMOUNT** modal cũ → **MOUNT** modal mới
6. Input mới được tạo → **MẤT FOCUS** ❌

---

## ✅ **Giải Pháp:**

### **Di chuyển Component ra ngoài**

```jsx
// ✅ SOLUTION: Define CategoryModal BÊN NGOÀI AdminCategories
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData,
  categories,
  editingCategory,
  imagePreview,
  uploadingImage,
  handleImageUpload,
  removeImage 
}) => {
  if (!isOpen) return null

  return (
    <form>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      {/* ... other inputs ... */}
    </form>
  )
}

// Main component
const AdminCategories = () => {
  const [formData, setFormData] = useState({ name: '', ... })

  return (
    <div>
      {/* Pass all required props */}
      <CategoryModal 
        isOpen={true}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        editingCategory={editingCategory}
        imagePreview={imagePreview}
        uploadingImage={uploadingImage}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
    </div>
  )
}
```

**Luồng xử lý ĐÚNG:**

1. User gõ "A" → `onChange` trigger
2. `setFormData({ name: 'A' })` → State thay đổi
3. `AdminCategories` **RE-RENDER**
4. React thấy `CategoryModal` là **cùng reference** (được define bên ngoài)
5. React chỉ **UPDATE PROPS**, không unmount/remount
6. Input giữ nguyên focus → **TIẾP TỤC GÕ** ✅

---

## 📝 **Code Changes:**

### **File: `frontend/src/pages/admin/AdminCategories.jsx`**

**TRƯỚC:**
```jsx
import toast from 'react-hot-toast'

const AdminCategories = () => {
  // ... states ...

  const CategoryModal = ({ isOpen, onClose, onSubmit, title }) => {
    // Modal uses formData, setFormData from parent scope
    return (...)
  }

  return (
    <div>
      <CategoryModal isOpen={showCreateModal} />
    </div>
  )
}
```

**SAU:**
```jsx
import toast from 'react-hot-toast'

// ✅ Moved outside - won't be re-created on each render
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  formData,        // ← Passed as prop
  setFormData,     // ← Passed as prop
  categories,      // ← Passed as prop
  editingCategory, // ← Passed as prop
  imagePreview,    // ← Passed as prop
  uploadingImage,  // ← Passed as prop
  handleImageUpload, // ← Passed as prop
  removeImage      // ← Passed as prop
}) => {
  if (!isOpen) return null
  return (...)
}

const AdminCategories = () => {
  // ... states ...

  return (
    <div>
      <CategoryModal 
        isOpen={showCreateModal}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        editingCategory={editingCategory}
        imagePreview={imagePreview}
        uploadingImage={uploadingImage}
        handleImageUpload={handleImageUpload}
        removeImage={removeImage}
      />
    </div>
  )
}
```

---

## 🎯 **Kết Quả:**

### **Trước Fix:**
```
User gõ: "R"
Input: "R" → LOST FOCUS ❌
User click lại input
User gõ: "a"
Input: "Ra" → LOST FOCUS ❌
User click lại input
User gõ: "u"
Input: "Rau" → LOST FOCUS ❌
```

### **Sau Fix:**
```
User gõ: "Rau củ quả"
Input: "Rau củ quả" → GIỮ FOCUS ✅
Không cần click lại!
```

---

## 🧪 **Test:**

1. Vào http://localhost:5173/admin/categories
2. Click **"Thêm danh mục"**
3. Gõ liên tục vào ô "Tên danh mục": `Rau củ quả tươi sống`
4. ✅ Phải gõ được liên tục không bị mất focus
5. Click **"Chỉnh sửa"** một danh mục bất kỳ
6. Sửa tên: `Thịt cá tươi ngon`
7. ✅ Phải gõ được liên tục không bị mất focus

---

## 📚 **Best Practices:**

### **1. Định nghĩa Component bên ngoài**
```jsx
// ✅ GOOD - Component không bị re-create
const Modal = ({ data, onChange }) => {...}

const ParentComponent = () => {
  return <Modal data={data} onChange={onChange} />
}

// ❌ BAD - Component bị re-create mỗi render
const ParentComponent = () => {
  const Modal = ({ data }) => {...}
  return <Modal data={data} />
}
```

### **2. Sử dụng React.memo khi cần**
```jsx
// Prevent re-render nếu props không đổi
const CategoryModal = React.memo(({ 
  isOpen, 
  formData, 
  setFormData 
}) => {
  // ...
})
```

### **3. Tránh inline function trong JSX**
```jsx
// ❌ BAD - Function mới mỗi render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ GOOD - useCallback để memoize
const handleClickWithId = useCallback(() => handleClick(id), [id])
<button onClick={handleClickWithId}>Click</button>
```

---

## ⚠️ **Lưu Ý:**

1. **Component nên được define ở top-level**, không nên define bên trong component khác
2. **Pass props thay vì dùng closure** để access parent state
3. Nếu modal phức tạp, xem xét tách ra **file riêng**:
   ```
   components/
     admin/
       CategoryModal.jsx    ← Separate file
   pages/
     admin/
       AdminCategories.jsx
   ```

---

## 🎉 **Summary:**

✅ **Fixed**: Input không còn bị mất focus khi gõ  
✅ **Method**: Di chuyển `CategoryModal` ra ngoài component  
✅ **Benefit**: User experience tốt hơn, gõ liên tục được  
✅ **Performance**: Giảm re-render không cần thiết  

---

## 🔗 **Related Issues:**

- React component re-creation causing input focus loss
- Nested component definitions anti-pattern
- Props vs closure in React components
