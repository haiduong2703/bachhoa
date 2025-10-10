# 🔧 Fix Category Product Count & Filter

## ❌ **Vấn Đề:**
1. **Số lượng sản phẩm trong danh mục đang sai** - Backend không trả về `productCount`
2. **Khi click vào danh mục không hiển thị sản phẩm** - Frontend pass sai param và backend filter sai

---

## ✅ **Giải Pháp:**

### **1. Backend: Thêm productCount vào API categories**

#### File: `backend/src/controllers/categoryController.js`

**Thêm import:**
```javascript
import { Category, Product } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../database/config.js';
```

**Sửa getCategories để count products:**
```javascript
// Get categories with product count
const categories = await Category.findAll({
  where: whereClause,
  limit: parseInt(limit),
  offset: parseInt(offset),
  order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  include: [
    {
      model: Category,
      as: 'children',
      where: { status: 'active' },
      required: false,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    },
    {
      model: Product,
      as: 'products',
      attributes: [],
      required: false,
      through: { attributes: [] }
    }
  ],
  attributes: {
    include: [
      [
        sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('products.id'))),
        'productCount'
      ]
    ]
  },
  group: ['Category.id', 'children.id'],
  subQuery: false
});

// Get total count without pagination
const count = await Category.count({
  where: whereClause
});
```

**Kết quả:** API `/api/v1/categories` giờ trả về:
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Rau củ quả",
        "productCount": 15,
        ...
      }
    ]
  }
}
```

---

### **2. Frontend: Hiển thị số sản phẩm trong Admin**

#### File: `frontend/src/pages/admin/AdminCategories.jsx`

**Thêm cột header:**
```jsx
<thead className="bg-gray-50">
  <tr>
    <th>Danh mục</th>
    <th>Danh mục cha</th>
    <th className="text-center">Số sản phẩm</th>  {/* ← THÊM */}
    <th>Trạng thái</th>
    <th>Ngày tạo</th>
    <th>Thao tác</th>
  </tr>
</thead>
```

**Thêm cell hiển thị:**
```jsx
<td className="px-6 py-4 whitespace-nowrap text-center">
  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {category.productCount || 0}
  </span>
</td>
```

---

### **3. Frontend: Fix Category Page - Hiển thị đúng số sản phẩm**

#### File: `frontend/src/pages/public/CategoryPage.jsx`

**Sửa hàm getCategoryProductCount:**
```javascript
// OLD - Random number
const getCategoryProductCount = (categoryName) => {
  return Math.floor(Math.random() * 50) + 1 // ❌ Sai
}

// NEW - Dùng API data
const getCategoryProductCount = (category) => {
  return category.productCount || 0 // ✅ Đúng
}
```

**Sửa link và badge:**
```jsx
{/* OLD - Pass category name */}
<Link to={`/products?category=${encodeURIComponent(category.name)}`}>
  {getCategoryProductCount(category.name)} sản phẩm
</Link>

{/* NEW - Pass category ID */}
<Link to={`/products?categoryId=${category.id}`}>
  {getCategoryProductCount(category)} sản phẩm
</Link>
```

---

### **4. Frontend: Fix Product List - Filter theo categoryId**

#### File: `frontend/src/pages/public/ProductListPage.jsx`

**Sửa useEffect đọc URL params:**
```javascript
// OLD
const categoryParam = searchParams.get('category') // ❌ Sai param name
if (categoryParam) {
  newFilters.category = categoryParam
}

// NEW  
const categoryParam = searchParams.get('categoryId') // ✅ Đọc đúng param
if (categoryParam) {
  newFilters.category = categoryParam // Backend expects 'category' with ID value
}
```

**Sửa handleCategoryChange:**
```javascript
// OLD
newParams.set('category', value) // ❌ URL param sai

// NEW
newParams.set('categoryId', value) // ✅ URL param đúng
```

**Dropdown đã đúng rồi (dùng ID):**
```jsx
<select onChange={(e) => handleCategoryChange(e.target.value)}>
  <option value="all">Tất cả danh mục</option>
  {categories.map(category => (
    <option key={category.id} value={category.id}>  {/* ✅ Đã dùng ID */}
      {category.name}
    </option>
  ))}
</select>
```

---

## 🔄 **Luồng Hoạt Động:**

### **Trước (Sai):**
1. User click danh mục "Rau củ" → Link: `/products?category=Rau củ`
2. Frontend đọc `category=Rau củ` → Pass to backend: `?category=Rau củ`
3. Backend filter: `WHERE category.id = 'Rau củ'` → ❌ Lỗi (string vs int)
4. Không tìm thấy sản phẩm

### **Sau (Đúng):**
1. User click danh mục "Rau củ" (ID=1) → Link: `/products?categoryId=1`
2. Frontend đọc `categoryId=1` → Pass to backend: `?category=1`
3. Backend filter: `WHERE category.id = 1` → ✅ Đúng
4. Hiển thị tất cả sản phẩm thuộc danh mục ID=1

---

## 🧪 **Test:**

### **1. Test API Backend:**
```bash
# Get categories with product count
curl http://localhost:5000/api/v1/categories

# Response:
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Rau củ quả",
        "productCount": "15",  # ← Có count rồi!
        ...
      }
    ]
  }
}
```

### **2. Test Frontend:**

**Admin Categories:**
- Vào http://localhost:5173/admin/categories
- Kiểm tra cột "Số sản phẩm" hiển thị đúng số

**Category Page:**
- Vào http://localhost:5173/categories
- Kiểm tra badge hiển thị đúng số sản phẩm
- Click vào danh mục → URL: `/products?categoryId=1`

**Product List:**
- Vào http://localhost:5173/products?categoryId=1
- Kiểm tra hiển thị đúng sản phẩm của danh mục đó
- Test dropdown filter danh mục

---

## 📝 **Files Đã Sửa:**

### Backend:
- ✅ `backend/src/controllers/categoryController.js`
  - Thêm import Product, sequelize
  - Thêm COUNT(products.id) vào attributes
  - Include products association với GROUP BY

### Frontend:
- ✅ `frontend/src/pages/admin/AdminCategories.jsx`
  - Thêm cột "Số sản phẩm" vào table header
  - Thêm cell hiển thị productCount

- ✅ `frontend/src/pages/public/CategoryPage.jsx`
  - Sửa getCategoryProductCount dùng category.productCount
  - Đổi link từ `?category=name` → `?categoryId=id`
  - Sửa badge pass category object thay vì name

- ✅ `frontend/src/pages/public/ProductListPage.jsx`
  - Đổi searchParams.get từ 'category' → 'categoryId'
  - Sửa handleCategoryChange set 'categoryId' vào URL
  - Dropdown đã đúng (dùng category.id)

---

## ⚠️ **Lưu Ý:**

1. **Backend API products đã đúng:**
   - Query param: `?category=1` (ID, không phải tên)
   - Filter: `WHERE category.id = categoryId`

2. **Dropdown category trong ProductListPage:**
   - `<option value={category.id}>` → ✅ Đã dùng ID
   - Không cần sửa

3. **Restart backend** để áp dụng thay đổi count logic
4. **Refresh frontend** để test link mới

---

## 🎯 **Kết Quả:**

✅ Admin categories hiển thị đúng số lượng sản phẩm  
✅ Category page hiển thị đúng số sản phẩm  
✅ Click vào category → lọc đúng sản phẩm theo ID  
✅ Dropdown filter category hoạt động đúng  
✅ URL sử dụng `categoryId` thống nhất
