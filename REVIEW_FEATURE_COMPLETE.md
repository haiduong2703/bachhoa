# ⭐ Product Review Feature - Complete Implementation

## 📋 **Tổng Quan**

Tính năng đánh giá sản phẩm cho phép khách hàng:
- ✅ Đánh giá sản phẩm từ 1-5 sao
- ✅ Viết tiêu đề và nội dung đánh giá
- ✅ Upload tối đa 5 hình ảnh
- ✅ Đánh dấu đánh giá hữu ích
- ✅ Chỉ đánh giá sản phẩm đã mua (delivered orders)

Admin có thể:
- ✅ Duyệt/Từ chối đánh giá
- ✅ Xóa đánh giá
- ✅ Filter theo trạng thái, số sao
- ✅ Tìm kiếm đánh giá

---

## 🗄️ **Database Schema**

### **Table: `reviews`**
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  images JSON DEFAULT '[]',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  
  INDEX idx_product_status (product_id, status),
  INDEX idx_user (user_id),
  INDEX idx_rating (rating)
);
```

---

## 🔧 **Backend Implementation**

### **1. Model: `backend/src/models/Review.js`**

**Key Features:**
- ✅ Validation: rating 1-5
- ✅ Status: pending/approved/rejected
- ✅ Images stored as JSON array
- ✅ Helpful count tracking

**Instance Methods:**
```javascript
Review.prototype.approve()      // Duyệt review
Review.prototype.reject()       // Từ chối review
Review.prototype.incrementHelpful()  // +1 helpful count
```

**Static Methods:**
```javascript
Review.getAverageRating(productId)      // Tính rating trung bình
Review.getRatingDistribution(productId)  // Phân phối sao (1-5)
```

### **2. Controller: `backend/src/controllers/reviewController.js`**

**Public Endpoints:**
```javascript
GET    /reviews/products/:productId/reviews  // Lấy reviews của sản phẩm
POST   /reviews/:id/helpful                  // Đánh dấu hữu ích
```

**Customer Endpoints (Authenticated):**
```javascript
GET    /reviews/my-reviews           // Lấy reviews của mình
GET    /reviews/can-review/:productId  // Check có thể review không
POST   /reviews                      // Tạo review mới
PUT    /reviews/:id                  // Sửa review
DELETE /reviews/:id                  // Xóa review
```

**Admin Endpoints:**
```javascript
GET    /reviews/admin/all            // Lấy tất cả reviews
PATCH  /reviews/admin/:id/approve    // Duyệt review
PATCH  /reviews/admin/:id/reject     // Từ chối review
DELETE /reviews/admin/:id            // Xóa review (admin)
```

### **3. Routes: `backend/src/routes/reviews.js`**

✅ Đã tạo và mount vào `/api/v1/reviews`

### **4. Associations trong `models/index.js`**

```javascript
// Review associations
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' })
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' })
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' })

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' })
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' })
```

---

## 🎨 **Frontend Implementation**

### **1. Components**

#### **A. ReviewList Component**
**File:** `frontend/src/components/product/ReviewList.jsx`

**Features:**
- ✅ Rating summary với average score
- ✅ Rating distribution (1-5 sao) với bar chart
- ✅ Filter theo số sao
- ✅ Display reviews với avatar, rating stars, images
- ✅ Helpful button với count
- ✅ Verified purchase badge

**Props:**
```javascript
{
  productId: number,
  reviews: array,
  statistics: {
    averageRating: number,
    totalReviews: number,
    distribution: { 1: count, 2: count, ... }
  },
  onReviewAdded: function
}
```

#### **B. ReviewForm Component**
**File:** `frontend/src/components/product/ReviewForm.jsx`

**Features:**
- ✅ Star rating selector với hover effect
- ✅ Title và comment inputs
- ✅ Image upload (max 5 images)
- ✅ Image preview với remove button
- ✅ Form validation
- ✅ Upload progress indicator

**Props:**
```javascript
{
  productId: number,
  orderId: number,
  onReviewSubmitted: function,
  onCancel: function
}
```

### **2. Product Detail Page Integration**

**File:** `frontend/src/pages/public/ProductDetailPage.jsx`

**Added:**
- ✅ Tab navigation (Description / Reviews)
- ✅ Write Review button (if can review)
- ✅ Review form modal
- ✅ Reviews list với statistics
- ✅ Auto-load reviews on mount
- ✅ Check permission to review

**New States:**
```javascript
const [activeTab, setActiveTab] = useState('description')
const [reviews, setReviews] = useState([])
const [reviewStats, setReviewStats] = useState(null)
const [showReviewForm, setShowReviewForm] = useState(false)
const [canReview, setCanReview] = useState(false)
```

**New Functions:**
```javascript
loadReviews()           // Load reviews từ API
checkCanReview()        // Check permission
handleReviewSubmitted() // Callback sau khi submit
```

### **3. Admin Reviews Page**

**File:** `frontend/src/pages/admin/AdminReviews.jsx`

**Features:**
- ✅ Reviews list table với product, user info
- ✅ Search bar (product name, customer name)
- ✅ Filter by status (pending/approved/rejected)
- ✅ Filter by rating (1-5 stars)
- ✅ Approve/Reject buttons
- ✅ Delete button
- ✅ Pagination
- ✅ Status badges with colors

**Actions:**
```javascript
handleApprove(id)   // Duyệt review
handleReject(id)    // Từ chối review
handleDelete(id)    // Xóa review
```

### **4. API Integration**

**File:** `frontend/src/services/api.js`

**Added reviewAPI:**
```javascript
export const reviewAPI = {
  getProductReviews: (productId, params) => ...,
  createReview: (data) => ...,
  updateReview: (id, data) => ...,
  deleteReview: (id) => ...,
  markHelpful: (id) => ...,
  getMyReviews: (params) => ...,
  canReview: (productId) => ...,
  // Admin
  getAllReviews: (params) => ...,
  approveReview: (id) => ...,
  rejectReview: (id) => ...,
  adminDeleteReview: (id) => ...,
}
```

### **5. Routing**

**File:** `frontend/src/App.jsx`

**Added:**
- ✅ Import AdminReviews component
- ✅ Route: `/admin/reviews` → `<AdminReviews />`

**File:** `frontend/src/components/layout/AdminSidebar.jsx`

**Added:**
- ✅ Import Star icon
- ✅ Menu item "Đánh giá" với path `/admin/reviews`

---

## 🎯 **User Flow**

### **Customer Journey:**

1. **Mua sản phẩm**
   - Customer đặt hàng
   - Order status = 'delivered'

2. **Viết đánh giá**
   - Vào Product Detail Page
   - Click tab "Đánh giá"
   - Click "Viết đánh giá"
   - Chọn số sao (1-5)
   - Nhập tiêu đề (optional)
   - Nhập nội dung (optional)
   - Upload ảnh (optional, max 5)
   - Click "Gửi đánh giá"

3. **Xem đánh giá**
   - Tab "Đánh giá" hiển thị:
     - Rating summary (average, total)
     - Rating distribution bars
     - Filter theo số sao
     - List reviews với stars, content, images
   - Click "Hữu ích" để support review

### **Admin Journey:**

1. **Quản lý đánh giá**
   - Vào `/admin/reviews`
   - Xem list reviews với status

2. **Duyệt/Từ chối**
   - Reviews có status "pending"
   - Click icon ✓ để duyệt
   - Click icon ✕ để từ chối
   - Confirmed reviews hiển thị trên product page

3. **Filter & Search**
   - Filter by status: all/pending/approved/rejected
   - Filter by rating: all/1-5 stars
   - Search by product name hoặc customer name

4. **Xóa review**
   - Click icon 🗑️
   - Confirm delete
   - Review bị xóa vĩnh viễn

---

## 🧪 **Testing Guide**

### **1. Test Customer Flow:**

```bash
# 1. Login as customer
POST /api/v1/auth/login
{
  "email": "customer@example.com",
  "password": "password"
}

# 2. Check if can review product
GET /api/v1/reviews/can-review/1
→ Response: { canReview: true/false, reason: "..." }

# 3. Create review
POST /api/v1/reviews
{
  "productId": 1,
  "orderId": 1,
  "rating": 5,
  "title": "Sản phẩm tuyệt vời",
  "comment": "Rất hài lòng với chất lượng",
  "images": ["url1", "url2"]
}

# 4. Get product reviews
GET /api/v1/reviews/products/1/reviews
→ Response: { reviews: [...], statistics: {...} }

# 5. Mark review helpful
POST /api/v1/reviews/1/helpful
```

### **2. Test Admin Flow:**

```bash
# 1. Login as admin
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# 2. Get all reviews
GET /api/v1/reviews/admin/all?status=pending&rating=5

# 3. Approve review
PATCH /api/v1/reviews/admin/1/approve

# 4. Reject review
PATCH /api/v1/reviews/admin/2/reject

# 5. Delete review
DELETE /api/v1/reviews/admin/3
```

### **3. Test Frontend:**

**Customer:**
1. Vào http://localhost:5173/products/1
2. Click tab "Đánh giá"
3. Click "Viết đánh giá" (nếu có quyền)
4. Điền form và submit
5. Check review hiển thị sau khi admin duyệt

**Admin:**
1. Vào http://localhost:5173/admin/reviews
2. Filter by "Chờ duyệt"
3. Click duyệt/từ chối
4. Verify status change

---

## 📊 **Statistics & Analytics**

### **Rating Summary:**
```javascript
{
  averageRating: 4.5,      // Average của tất cả reviews
  totalReviews: 120,       // Tổng số reviews
  distribution: {
    5: 80,  // 80 reviews 5 sao
    4: 25,  // 25 reviews 4 sao
    3: 10,  // 10 reviews 3 sao
    2: 3,   // 3 reviews 2 sao
    1: 2    // 2 reviews 1 sao
  }
}
```

### **Display:**
- Rating stars với decimal (4.5 → 4.5/5)
- Progress bars cho distribution
- Percentage calculation
- Filter count per rating

---

## 🔒 **Security & Validation**

### **Backend Validation:**

1. **Only review purchased products:**
   ```javascript
   // Check order exists, delivered, and contains product
   const order = await Order.findOne({
     where: { id: orderId, userId, status: 'delivered' },
     include: [{ model: OrderItem, where: { productId } }]
   })
   ```

2. **No duplicate reviews:**
   ```javascript
   const existing = await Review.findOne({
     where: { productId, userId, orderId }
   })
   if (existing) throw new Error('Already reviewed')
   ```

3. **Rating validation:**
   ```javascript
   validate: { min: 1, max: 5 }
   ```

### **Frontend Validation:**

1. **Image limits:**
   - Max 5 images
   - Max 5MB per image
   - Types: image/jpeg, image/png, image/gif

2. **Rating required:**
   ```javascript
   if (formData.rating === 0) {
     toast.error('Vui lòng chọn số sao')
     return
   }
   ```

3. **Permission check:**
   ```javascript
   const { canReview } = await api.get(`/reviews/can-review/${productId}`)
   if (!canReview) {
     // Hide write review button
   }
   ```

---

## 🚀 **Deployment Checklist**

### **Backend:**
- ✅ Review model imported in models/index.js
- ✅ Associations defined
- ✅ Review routes mounted in routes/index.js
- ✅ Database migrations run (reviews table exists)
- ✅ SMTP service configured (for notification emails)

### **Frontend:**
- ✅ ReviewList component created
- ✅ ReviewForm component created
- ✅ Product detail page updated with tabs
- ✅ Admin reviews page created
- ✅ Routes added to App.jsx
- ✅ Sidebar menu item added
- ✅ reviewAPI integrated

### **Testing:**
- ✅ Customer can create review
- ✅ Reviews display on product page
- ✅ Admin can approve/reject
- ✅ Filter & search work
- ✅ Image upload works
- ✅ Helpful button works

---

## 📝 **Files Modified/Created**

### **Backend:**
- ✅ `backend/src/models/Review.js` (already exists)
- ✅ `backend/src/controllers/reviewController.js` (already exists)
- ✅ `backend/src/routes/reviews.js` (already exists)
- ✅ `backend/src/routes/index.js` (updated - import & mount)
- ✅ `backend/src/models/index.js` (already has associations)

### **Frontend:**
- ✅ `frontend/src/components/product/ReviewList.jsx` (created)
- ✅ `frontend/src/components/product/ReviewForm.jsx` (created)
- ✅ `frontend/src/pages/admin/AdminReviews.jsx` (created)
- ✅ `frontend/src/pages/public/ProductDetailPage.jsx` (updated)
- ✅ `frontend/src/services/api.js` (updated - add reviewAPI)
- ✅ `frontend/src/App.jsx` (updated - import & route)
- ✅ `frontend/src/components/layout/AdminSidebar.jsx` (updated - menu item)

---

## 🎉 **Summary**

### **What We Built:**
1. ✅ Complete review system với rating, comment, images
2. ✅ Admin moderation với approve/reject
3. ✅ Statistics dashboard với average rating và distribution
4. ✅ Filter & search functionality
5. ✅ Responsive UI với tabs và modals
6. ✅ Permission system (only review purchased products)
7. ✅ Helpful voting system

### **Key Features:**
- ⭐ 5-star rating system
- 📝 Title và detailed comments
- 📷 Multiple image upload
- 👍 Helpful voting
- 🔒 Purchase verification
- ✅ Admin moderation
- 📊 Rating statistics
- 🔍 Filter & search

### **Tech Stack:**
- **Backend**: Node.js, Express, Sequelize, MySQL
- **Frontend**: React, Zustand, Tailwind CSS
- **Upload**: Multer, Sharp
- **Icons**: Lucide React

---

## 🔗 **API Endpoints Summary**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/reviews/products/:productId/reviews` | Public | Lấy reviews của sản phẩm |
| POST | `/api/v1/reviews/:id/helpful` | Public | Đánh dấu hữu ích |
| GET | `/api/v1/reviews/my-reviews` | Customer | Lấy reviews của mình |
| GET | `/api/v1/reviews/can-review/:productId` | Customer | Check có thể review |
| POST | `/api/v1/reviews` | Customer | Tạo review mới |
| PUT | `/api/v1/reviews/:id` | Customer | Sửa review |
| DELETE | `/api/v1/reviews/:id` | Customer | Xóa review |
| GET | `/api/v1/reviews/admin/all` | Admin | Lấy tất cả reviews |
| PATCH | `/api/v1/reviews/admin/:id/approve` | Admin | Duyệt review |
| PATCH | `/api/v1/reviews/admin/:id/reject` | Admin | Từ chối review |
| DELETE | `/api/v1/reviews/admin/:id` | Admin | Xóa review (admin) |

---

**🎊 Review Feature Implementation Complete!** 🎊
