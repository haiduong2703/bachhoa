# 🔧 Fix Category Filter Persistence Issue

## ❌ **Vấn Đề:**

**Luồng bị lỗi:**
1. User vào `/categories` → Click "Rau củ quả" (ID=2)
2. Chuyển đến `/products?categoryId=2` → Hiển thị sản phẩm của category 2 ✅
3. User click menu "Sản phẩm" → Chuyển đến `/products`
4. **BUG**: Vẫn hiển thị sản phẩm của category 2, không hiển thị ALL ❌

**Nguyên nhân:**
- URL đã đổi về `/products` (không có query param)
- Nhưng **filter state vẫn giữ `category: 2`**
- Backend vẫn nhận request với `?category=2`

---

## 🔍 **Phân Tích Chi Tiết:**

### **Code cũ (SAI):**

```jsx
useEffect(() => {
  const categoryParam = searchParams.get('categoryId')
  const searchParam = searchParams.get('q')

  const newFilters = {}

  if (categoryParam) {
    newFilters.category = categoryParam  // ← Chỉ set khi CÓ param
  }
  if (searchParam) {
    newFilters.search = searchParam
  }

  // ❌ PROBLEM: Chỉ update khi có params
  if (Object.keys(newFilters).length > 0) {
    updateFilters(newFilters)
  }
}, [searchParams])
```

**Khi không có query params:**
- `newFilters = {}` → Object rỗng
- `Object.keys(newFilters).length === 0` → Không gọi `updateFilters()`
- Filter state **GIỮ NGUYÊN** giá trị cũ: `{ category: 2, search: '' }`
- Backend vẫn filter theo category 2 ❌

---

## ✅ **Giải Pháp:**

### **1. Always Reset Filters to Match URL**

```jsx
useEffect(() => {
  const categoryParam = searchParams.get('categoryId')
  const searchParam = searchParams.get('q')

  // ✅ SOLUTION: Always start with reset values
  const newFilters = {
    category: null,  // Reset category by default
    search: '',      // Reset search by default
  }

  // Then override with URL params if they exist
  if (categoryParam) {
    newFilters.category = categoryParam
  }
  if (searchParam) {
    newFilters.search = searchParam
    setSearchInput(searchParam)
  } else {
    setSearchInput('') // ✅ Clear input if no query param
  }

  // ✅ ALWAYS update filters to match URL
  updateFilters(newFilters)
}, [searchParams])
```

**Luồng ĐÚNG khi vào `/products` (no params):**
1. `categoryParam = null`, `searchParam = null`
2. `newFilters = { category: null, search: '' }` → Reset!
3. `updateFilters(newFilters)` → Store được reset
4. `fetchProducts()` → Request không có filter
5. Backend trả về **ALL products** ✅

---

### **2. Fix Dropdown Value**

**Code cũ:**
```jsx
<select value={filters.category || 'all'}>
  <option value="all">Tất cả danh mục</option>
  {/* ... */}
</select>
```

**Vấn đề:**
- Khi `filters.category = null`, `value = 'all'`
- Nhưng `null !== 'all'` → React warning: uncontrolled to controlled

**Code mới:**
```jsx
<select value={filters.category || ''}>  {/* ← Empty string */}
  <option value="">Tất cả danh mục</option>  {/* ← Empty string */}
  {/* ... */}
</select>

const handleCategoryChange = (value) => {
  updateFilters({ category: value || null })  // ← Convert empty to null
  
  const newParams = new URLSearchParams(searchParams)
  if (value) {
    newParams.set('categoryId', value)
  } else {
    newParams.delete('categoryId')  // ← Remove param when "All"
  }
  setSearchParams(newParams)
}
```

---

## 📝 **Code Changes:**

### **File: `frontend/src/pages/public/ProductListPage.jsx`**

**Change 1: Reset filters when no URL params**
```jsx
// BEFORE
const newFilters = {}
if (categoryParam) {
  newFilters.category = categoryParam
}
if (Object.keys(newFilters).length > 0) {
  updateFilters(newFilters)
}

// AFTER  
const newFilters = {
  category: null,  // ✅ Reset by default
  search: '',      // ✅ Reset by default
}
if (categoryParam) {
  newFilters.category = categoryParam
}
// ✅ Always update to match URL
updateFilters(newFilters)
```

**Change 2: Clear search input when no query param**
```jsx
// BEFORE
if (searchParam) {
  setSearchInput(searchParam)
}

// AFTER
if (searchParam) {
  setSearchInput(searchParam)
} else {
  setSearchInput('') // ✅ Clear input
}
```

**Change 3: Fix dropdown to use empty string**
```jsx
// BEFORE
<select value={filters.category || 'all'}>
  <option value="all">Tất cả danh mục</option>

// AFTER
<select value={filters.category || ''}>
  <option value="">Tất cả danh mục</option>
```

**Change 4: Handle empty string in change handler**
```jsx
// BEFORE
updateFilters({ category: value === 'all' ? null : value })
if (value && value !== 'all') {
  newParams.set('categoryId', value)
}

// AFTER
updateFilters({ category: value || null })
if (value) {
  newParams.set('categoryId', value)
} else {
  newParams.delete('categoryId')
}
```

---

## 🔄 **Luồng Hoạt Động:**

### **Scenario 1: Category → All Products**

**TRƯỚC (Lỗi):**
```
1. URL: /products?categoryId=2
   State: { category: 2 }
   Display: 5 products from category 2 ✅

2. Click "Sản phẩm" menu
   URL: /products (no params)
   State: { category: 2 }  ← ❌ Vẫn giữ nguyên!
   Display: 5 products from category 2 ❌ SAI!
```

**SAU (Đúng):**
```
1. URL: /products?categoryId=2
   State: { category: 2 }
   Display: 5 products from category 2 ✅

2. Click "Sản phẩm" menu
   URL: /products (no params)
   State: { category: null }  ← ✅ Reset!
   Display: 50 products (all) ✅ ĐÚNG!
```

### **Scenario 2: Search → All Products**

**TRƯỚC:**
```
1. URL: /products?q=rau
   State: { search: 'rau' }
   Input: "rau"
   Display: 3 products matching "rau" ✅

2. Click "Sản phẩm" menu
   URL: /products
   State: { search: 'rau' }  ← ❌ Giữ nguyên
   Input: "rau"  ← ❌ Giữ nguyên
   Display: 3 products ❌ SAI!
```

**SAU:**
```
1. URL: /products?q=rau
   State: { search: 'rau' }
   Input: "rau"
   Display: 3 products matching "rau" ✅

2. Click "Sản phẩm" menu
   URL: /products
   State: { search: '' }  ← ✅ Reset
   Input: ""  ← ✅ Clear
   Display: 50 products ✅ ĐÚNG!
```

---

## 🧪 **Test Cases:**

### **Test 1: Category Filter**
1. Vào `/categories` → Click "Rau củ quả"
2. URL: `/products?categoryId=2` → Hiển thị 5 sản phẩm ✅
3. Click "Sản phẩm" ở menu
4. URL: `/products` → **Phải hiển thị TẤT CẢ sản phẩm** ✅
5. Dropdown category: **"Tất cả danh mục"** ✅

### **Test 2: Search**
1. Vào `/products` → Gõ search "rau"
2. URL: `/products?q=rau` → Hiển thị kết quả search ✅
3. Click "Sản phẩm" ở menu
4. URL: `/products` → **Hiển thị tất cả, search input trống** ✅

### **Test 3: Category + Search**
1. URL: `/products?categoryId=2&q=rau`
2. Click "Sản phẩm"
3. URL: `/products` → **Reset cả category và search** ✅

### **Test 4: Dropdown Category**
1. Vào `/products?categoryId=2`
2. Dropdown: **Hiển thị "Rau củ quả"** ✅
3. Chọn "Tất cả danh mục"
4. URL: `/products` → **Hiển thị tất cả** ✅

---

## 📊 **So Sánh:**

| Hành động | URL | State (TRƯỚC) | State (SAU) | Hiển thị |
|-----------|-----|---------------|-------------|----------|
| Vào category 2 | `/products?categoryId=2` | `{category: 2}` | `{category: 2}` | 5 products ✅ |
| Click "Sản phẩm" | `/products` | `{category: 2}` ❌ | `{category: null}` ✅ | ALL products ✅ |
| Search "rau" | `/products?q=rau` | `{search: 'rau'}` | `{search: 'rau'}` | 3 results ✅ |
| Click "Sản phẩm" | `/products` | `{search: 'rau'}` ❌ | `{search: ''}` ✅ | ALL products ✅ |

---

## ⚠️ **Lưu Ý:**

### **1. URL là Source of Truth**
```jsx
// ✅ GOOD - URL controls state
useEffect(() => {
  const filters = getFiltersFromURL(searchParams)
  updateFilters(filters)  // State follows URL
}, [searchParams])

// ❌ BAD - State can be out of sync with URL
useEffect(() => {
  if (categoryParam) {
    updateFilters({ category: categoryParam })
  }
  // Missing: What if no param? State not reset!
}, [searchParams])
```

### **2. Always Reset Default Values**
```jsx
// ✅ GOOD - Explicit reset
const newFilters = {
  category: null,
  search: '',
  sortBy: 'created_at',
  sortOrder: 'desc'
}
// Then override with URL params

// ❌ BAD - Partial updates
const newFilters = {}
if (categoryParam) newFilters.category = categoryParam
// Other filters keep old values!
```

### **3. Sync All Related State**
```jsx
// ✅ GOOD - Sync input with filter
if (searchParam) {
  setSearchInput(searchParam)
} else {
  setSearchInput('') // Clear when no param
}

// ❌ BAD - Input out of sync
if (searchParam) {
  setSearchInput(searchParam)
}
// Input keeps old value when navigating away!
```

---

## 🎯 **Kết Quả:**

✅ **Fixed**: Click "Sản phẩm" hiển thị tất cả sản phẩm  
✅ **Fixed**: Dropdown reset về "Tất cả danh mục"  
✅ **Fixed**: Search input clear khi không có query  
✅ **Fixed**: URL và State luôn đồng bộ  
✅ **Benefit**: User experience nhất quán và dễ hiểu  

---

## 🔗 **Related Concepts:**

- **URL as Single Source of Truth**: URL params control component state
- **Controlled Components**: Form inputs always reflect state
- **State Synchronization**: Multiple states (URL, filters, inputs) must be in sync
- **Navigation Side Effects**: Must reset state when navigating to "clean" routes
