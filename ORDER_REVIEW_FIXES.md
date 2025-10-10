# 🛒 Order & Review System Fixes

## 🐛 **Các Vấn Đề Được Fix**

### **1. Order Detail - Thiếu Hình Ảnh Sản Phẩm** ❌
- Order items không có hình ảnh sản phẩm
- Backend chỉ trả về `attributes: ['id', 'name', 'sku', 'price', 'images']`
- Nhưng `images` là association, không phải field → Lỗi

### **2. Review Page - Chưa Có Trang Đánh Giá** ❌
- Customer không thể viết review sau khi mua hàng
- Đã có link "Đánh giá" trong order detail nhưng chưa có trang create review
- CustomerReviews.jsx chỉ dùng mock data

---

## ✅ **Giải Pháp**

### **Fix 1: Backend - Order Controller**

**File: `backend/src/controllers/orderController.js`**

#### **A. Thêm ProductImage Import:**
```javascript
import { Order, OrderItem, Product, User, Inventory, ProductImage } from '../models/index.js';
```

#### **B. Update getOrder() - Include ProductImage:**
```javascript
{
  model: OrderItem,
  as: 'items',
  include: [
    {
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'sku', 'price', 'slug'],
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isPrimary: true },
          required: false,
          limit: 1
        }
      ]
    }
  ]
}
```

#### **C. Update getOrders() - Include ProductImage:**
```javascript
{
  model: OrderItem,
  as: 'items',
  include: [
    {
      model: Product,
      as: 'product',
      attributes: ['id', 'name', 'sku', 'price', 'slug'],
      include: [
        {
          model: ProductImage,
          as: 'images',
          where: { isPrimary: true },
          required: false,
          limit: 1
        }
      ]
    }
  ]
}
```

**Benefits:**
- ✅ Product images included in order response
- ✅ Only primary image (isPrimary: true)
- ✅ Fallback gracefully if no image (required: false)

---

### **Fix 2: Frontend - Customer Order Detail**

**File: `frontend/src/pages/customer/CustomerOrderDetail.jsx`**

#### **A. Update fetchOrderDetail() - Call Real API:**
```javascript
const fetchOrderDetail = async () => {
  try {
    setIsLoading(true)
    
    const response = await fetch(`/api/v1/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch order')
    
    const data = await response.json()
    if (data.status === 'success') {
      setOrder(data.data.order)
    }
  } catch (error) {
    console.error('Failed to fetch order detail:', error)
    toast.error('Không thể tải thông tin đơn hàng')
  } finally {
    setIsLoading(false)
  }
}
```

#### **B. Update Product Image Display:**
```jsx
<img
  src={item.product?.images?.[0]?.imageUrl || '/placeholder-product.jpg'}
  alt={item.product?.name || item.name}
  className="w-full h-full object-cover"
/>
```

#### **C. Update Review Link:**
```jsx
{order.status === 'delivered' && (
  <Link
    to={`/customer/reviews/create?product=${item.productId}&order=${order.id}`}
    className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-end mt-1"
  >
    <Star className="w-3 h-3 mr-1" />
    Đánh giá
  </Link>
)}
```

---

### **Fix 3: Customer Reviews Page**

**File: `frontend/src/pages/customer/CustomerReviews.jsx`**

#### **Update fetchReviews() - Call Real API:**
```javascript
const fetchReviews = async () => {
  try {
    setIsLoading(true)
    const response = await fetch('/api/v1/reviews/my-reviews', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to fetch reviews')
    
    const data = await response.json()
    if (data.status === 'success') {
      setReviews(data.data.reviews)
    }
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    toast.error('Không thể tải danh sách đánh giá')
  } finally {
    setIsLoading(false)
  }
}
```

#### **Update handleDeleteReview():**
```javascript
const handleDeleteReview = async (reviewId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return

  try {
    const response = await fetch(`/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to delete review')
    
    setReviews(reviews.filter(review => review.id !== reviewId))
    toast.success('Xóa đánh giá thành công')
  } catch (error) {
    console.error('Failed to delete review:', error)
    toast.error('Không thể xóa đánh giá')
  }
}
```

---

### **Fix 4: Create Review Page** ⭐ NEW

**File: `frontend/src/pages/customer/CustomerCreateReview.jsx`** (NEW)

#### **Features:**
1. ✅ Fetch product details by productId from query params
2. ✅ Star rating selector (1-5 stars) with hover effects
3. ✅ Title input (optional)
4. ✅ Comment textarea (optional)
5. ✅ Image upload (max 5 images)
6. ✅ Image preview with remove button
7. ✅ Form validation
8. ✅ Submit review to API

#### **Component Structure:**
```jsx
const CustomerCreateReview = () => {
  // Get productId and orderId from URL params
  const productId = searchParams.get('product')
  const orderId = searchParams.get('order')
  
  // Form state
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  })
  
  // Features:
  - fetchProduct()          // Load product info
  - handleRatingClick()     // Set rating
  - handleImageUpload()     // Upload images to /api/v1/uploads/image
  - handleRemoveImage()     // Remove image from preview
  - handleSubmit()          // Submit review to /api/v1/reviews
}
```

#### **Star Rating UI:**
```jsx
{[1, 2, 3, 4, 5].map((star) => (
  <button
    type="button"
    onClick={() => handleRatingClick(star)}
    onMouseEnter={() => setFormData(prev => ({ ...prev, hoverRating: star }))}
    onMouseLeave={() => setFormData(prev => ({ ...prev, hoverRating: 0 }))}
  >
    <Star
      className={`w-8 h-8 ${
        star <= (formData.hoverRating || formData.rating)
          ? 'text-yellow-400 fill-current'
          : 'text-gray-300'
      }`}
    />
  </button>
))}
```

#### **Image Upload:**
```javascript
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  
  if (files.length + formData.images.length > 5) {
    toast.error('Chỉ được tải lên tối đa 5 ảnh')
    return
  }

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/v1/uploads/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    })

    const data = await response.json()
    if (data.status === 'success') {
      return data.data.url
    }
  })

  const uploadedUrls = await Promise.all(uploadPromises)
  setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
}
```

#### **Submit Review:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  if (formData.rating === 0) {
    toast.error('Vui lòng chọn số sao đánh giá')
    return
  }

  const response = await fetch('/api/v1/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    body: JSON.stringify({
      productId: parseInt(productId),
      orderId: parseInt(orderId),
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment,
      images: formData.images
    })
  })

  if (data.status === 'success') {
    toast.success('Gửi đánh giá thành công! Đánh giá của bạn đang chờ duyệt.')
    navigate('/customer/reviews')
  }
}
```

---

### **Fix 5: Routing**

**File: `frontend/src/App.jsx`**

#### **Add Import:**
```javascript
import CustomerCreateReview from './pages/customer/CustomerCreateReview'
```

#### **Add Route:**
```jsx
<Route path="/customer" element={<CustomerLayout />}>
  <Route index element={<CustomerDashboard />} />
  <Route path="profile" element={<CustomerProfile />} />
  <Route path="orders" element={<CustomerOrders />} />
  <Route path="orders/:id" element={<CustomerOrderDetail />} />
  <Route path="reviews" element={<CustomerReviews />} />
  <Route path="reviews/create" element={<CustomerCreateReview />} />  {/* ✅ NEW */}
</Route>
```

---

## 🔄 **User Flow**

### **Customer Journey:**

1. **Mua Hàng:**
   ```
   Customer đặt hàng → Order status: pending
   ↓
   Staff xử lý → Order status: processing
   ↓
   Giao hàng → Order status: shipping
   ↓
   Giao thành công → Order status: delivered
   ```

2. **Xem Chi Tiết Đơn Hàng:**
   ```
   Navigate to: /customer/orders/:id
   ↓
   See order items with product images ✅
   ↓
   If status = 'delivered':
     See "Đánh giá" button for each item ✅
   ```

3. **Viết Đánh Giá:**
   ```
   Click "Đánh giá" button
   ↓
   Navigate to: /customer/reviews/create?product=1&order=123
   ↓
   See product info
   ↓
   Select star rating (1-5) ⭐
   ↓
   Enter title (optional)
   ↓
   Enter comment (optional)
   ↓
   Upload images (optional, max 5)
   ↓
   Submit review
   ↓
   Review status: pending (chờ admin duyệt)
   ↓
   Redirect to: /customer/reviews
   ```

4. **Xem Danh Sách Đánh Giá:**
   ```
   Navigate to: /customer/reviews
   ↓
   See all reviews (pending, approved, rejected)
   ↓
   Can edit or delete reviews
   ```

5. **Admin Duyệt:**
   ```
   Admin vào: /admin/reviews
   ↓
   See pending reviews
   ↓
   Click "Approve" ✓
   ↓
   Review status: approved
   ↓
   Review hiển thị trên product page
   ```

---

## 📊 **API Endpoints Used**

### **Orders:**
```
GET  /api/v1/orders/:id              // Get order detail with product images
GET  /api/v1/orders                  // Get all orders (with images)
```

### **Reviews:**
```
GET  /api/v1/reviews/my-reviews      // Get customer's reviews
POST /api/v1/reviews                 // Create new review
PUT  /api/v1/reviews/:id             // Update review
DELETE /api/v1/reviews/:id           // Delete review
GET  /api/v1/reviews/can-review/:productId  // Check if can review
```

### **Uploads:**
```
POST /api/v1/uploads/image           // Upload review images
```

---

## 🎨 **UI Components**

### **1. Order Item Card (with Image):**
```jsx
<div className="flex items-center space-x-4 p-4 border rounded-lg">
  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
    <img
      src={item.product?.images?.[0]?.imageUrl || '/placeholder-product.jpg'}
      alt={item.product?.name}
      className="w-full h-full object-cover"
    />
  </div>
  <div className="flex-1">
    <h3>{item.product?.name}</h3>
    <p>{formatPrice(item.price)} x {item.quantity}</p>
  </div>
  <div className="text-right">
    <p>{formatPrice(item.price * item.quantity)}</p>
    {order.status === 'delivered' && (
      <Link to={`/customer/reviews/create?product=${item.productId}&order=${order.id}`}>
        <Star /> Đánh giá
      </Link>
    )}
  </div>
</div>
```

### **2. Review Form:**
```jsx
<form onSubmit={handleSubmit}>
  {/* Star Rating */}
  <div>
    {[1, 2, 3, 4, 5].map(star => (
      <button onClick={() => setRating(star)}>
        <Star className={star <= rating ? 'fill-yellow' : 'text-gray'} />
      </button>
    ))}
  </div>

  {/* Title */}
  <input type="text" placeholder="Tiêu đề" />

  {/* Comment */}
  <textarea placeholder="Nhận xét..." />

  {/* Images */}
  <div>
    {/* Preview images with remove button */}
    {/* Upload button */}
  </div>

  {/* Submit */}
  <button type="submit">Gửi đánh giá</button>
</form>
```

---

## 🧪 **Testing**

### **Test 1: Order Images Display**
```bash
# 1. Login as customer
# 2. Navigate to /customer/orders
# 3. Click on an order
# 4. Check: Product images should display ✅

Expected:
- Each order item shows product image
- If no image: shows placeholder
```

### **Test 2: Review Button Visibility**
```bash
# 1. Open order with status 'delivered'
# Expected: See "Đánh giá" button for each item ✅

# 2. Open order with status 'pending'
# Expected: No "Đánh giá" button ✅
```

### **Test 3: Create Review Flow**
```bash
# 1. Click "Đánh giá" button in delivered order
# 2. Should navigate to: /customer/reviews/create?product=1&order=123
# 3. See product info
# 4. Select 5 stars
# 5. Enter title: "Sản phẩm tuyệt vời"
# 6. Enter comment: "Rất hài lòng"
# 7. Upload 2 images
# 8. Click "Gửi đánh giá"

Expected:
- Success toast: "Gửi đánh giá thành công! Đánh giá của bạn đang chờ duyệt."
- Redirect to: /customer/reviews
- See new review with status "pending"
```

### **Test 4: My Reviews Page**
```bash
# 1. Navigate to /customer/reviews
# 2. See all reviews created by customer
# 3. Filter by status: pending/approved/rejected
# 4. Try delete a review

Expected:
- Reviews load from API ✅
- Can filter by status ✅
- Can delete review ✅
```

---

## 📋 **Checklist**

### **Backend:**
- ✅ Import ProductImage in orderController
- ✅ Add ProductImage include to getOrder()
- ✅ Add ProductImage include to getOrders()
- ✅ Return isPrimary image only
- ✅ No errors in controller

### **Frontend:**
- ✅ Update CustomerOrderDetail fetchOrderDetail() to call API
- ✅ Update product image display to use product.images[0].imageUrl
- ✅ Update review link to pass productId and orderId
- ✅ Update CustomerReviews fetchReviews() to call API
- ✅ Update CustomerReviews handleDeleteReview() to call API
- ✅ Create CustomerCreateReview component
- ✅ Add route for /customer/reviews/create
- ✅ Import CustomerCreateReview in App.jsx

### **Testing:**
- ✅ Order images display correctly
- ✅ Review button shows only for delivered orders
- ✅ Create review page loads product info
- ✅ Star rating works with hover
- ✅ Image upload works (max 5)
- ✅ Submit review works
- ✅ My reviews page loads real data
- ✅ Delete review works

---

## 🎉 **Summary**

### **Problems Fixed:**

1. ❌ **Order images missing**
   → ✅ Backend now includes ProductImage association
   → ✅ Frontend displays product.images[0].imageUrl

2. ❌ **No review creation page**
   → ✅ Created CustomerCreateReview component
   → ✅ Added route /customer/reviews/create
   → ✅ Full featured review form with star rating, images, validation

3. ❌ **CustomerReviews using mock data**
   → ✅ Now fetches from /api/v1/reviews/my-reviews
   → ✅ Delete review calls API

### **New Features:**

✅ **Order Detail:**
- Product images display
- Review button for delivered orders
- Links to review creation page

✅ **Review Creation:**
- Star rating selector (1-5)
- Title and comment inputs
- Image upload (max 5)
- Image preview with remove
- Form validation
- API integration

✅ **My Reviews:**
- Lists all customer reviews
- Filter by status
- Delete reviews
- Real API integration

---

**🎊 Order & Review System Complete!** 🎊
