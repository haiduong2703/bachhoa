# 📦 Fix: Staff/Admin Orders Page - Load từ API

## 🐛 **Vấn đề:**

Trang quản lý đơn hàng của Staff và Admin đang dùng dữ liệu hardcode thay vì load từ API, khiến không thể xem đơn hàng thực tế của khách hàng.

## 💡 **Nguyên nhân:**

- `StaffOrders.jsx` và `AdminOrders.jsx` đều có hàm `fetchOrders()` nhưng chỉ set dữ liệu hardcode
- Không gọi `orderAPI.getAllOrders()` để lấy dữ liệu thật từ backend

## ✅ **Giải pháp:**

### 1. Sửa `StaffOrders.jsx`

**Before:**

```javascript
const fetchOrders = async () => {
  try {
    setIsLoading(true);
    // ❌ Hardcoded data
    const realOrders = [
      {
        id: 1,
        orderNumber: "BH1755847565747001",
        // ... hardcoded values
      },
    ];
    setOrders(realOrders);
  } catch (error) {
    // ...
  }
};

useEffect(() => {
  fetchOrders();
}, []); // ❌ Chỉ fetch một lần
```

**After:**

```javascript
const fetchOrders = async () => {
  try {
    setIsLoading(true);

    // ✅ Fetch from API
    const response = await orderAPI.getAllOrders({
      page: 1,
      limit: 100,
      sortBy,
      sortOrder,
    });

    const apiOrders = response.data.data.orders || [];

    // ✅ Transform API data
    const transformedOrders = apiOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        firstName: order.user?.firstName || "Khách",
        lastName: order.user?.lastName || "Hàng",
        email: order.user?.email || "N/A",
        phone: order.user?.phone || "N/A",
      },
      status: order.status,
      total: parseFloat(order.totalAmount),
      itemCount: order.items?.length || 0,
      created_at: order.createdAt || order.created_at,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items:
        order.items?.map((item) => ({
          id: item.id,
          name: item.product?.name || "Sản phẩm",
          quantity: item.quantity,
          price: parseFloat(item.unitPrice),
        })) || [],
    }));

    setOrders(transformedOrders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    toast.error("Không thể tải danh sách đơn hàng");
  }
};

useEffect(() => {
  fetchOrders();
}, [sortBy, sortOrder]); // ✅ Re-fetch khi sort thay đổi
```

### 2. Sửa `AdminOrders.jsx`

Tương tự như StaffOrders, thêm:

- Gọi `orderAPI.getAllOrders()`
- Transform data từ API format
- Update useEffect dependencies

## 📊 **Data Mapping:**

### API Response Structure:

```javascript
{
  status: "success",
  data: {
    orders: [
      {
        id: 1,
        orderNumber: "ORD1234567890",
        userId: 3,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: "cod",
        subtotal: 150000,
        shippingAmount: 30000,
        totalAmount: 180000,
        shippingAddress: {
          recipientName: "Khách Hàng",
          recipientPhone: "0123456789",
          addressLine1: "123 Đường ABC",
          ward: "Phường 1",
          district: "Quận 1",
          city: "TP.HCM"
        },
        user: {
          id: 3,
          firstName: "Khách",
          lastName: "Hàng",
          email: "customer@bachhoa.com",
          phone: "0123456789"
        },
        items: [
          {
            id: 1,
            orderId: 1,
            productId: 5,
            quantity: 2,
            unitPrice: 25000,
            totalPrice: 50000,
            product: {
              id: 5,
              name: "Cà chua bi",
              sku: "SP005",
              price: 25000
            }
          }
        ],
        createdAt: "2025-10-29T10:30:00.000Z"
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
      itemsPerPage: 100
    }
  }
}
```

### Transformed Component Format:

```javascript
{
  id: 1,
  orderNumber: "ORD1234567890",
  customer: {
    firstName: "Khách",
    lastName: "Hàng",
    email: "customer@bachhoa.com",
    phone: "0123456789"
  },
  status: "pending",
  total: 180000,
  itemCount: 1,
  created_at: "2025-10-29T10:30:00.000Z",
  shippingAddress: {...}, // Full address object for StaffOrders
  // OR
  shippingAddress: "TP.HCM, Quận 1, Phường 1", // String for AdminOrders
  paymentMethod: "cod",
  paymentStatus: "unpaid",
  items: [
    {
      id: 1,
      name: "Cà chua bi",
      quantity: 2,
      price: 25000
    }
  ]
}
```

## 📁 **Files đã sửa:**

1. **`frontend/src/pages/staff/StaffOrders.jsx`**

   - ✅ Fetch orders từ API
   - ✅ Transform data structure
   - ✅ Update useEffect dependencies

2. **`frontend/src/pages/admin/AdminOrders.jsx`**
   - ✅ Fetch orders từ API
   - ✅ Transform data structure
   - ✅ Update useEffect dependencies

## 🧪 **Test:**

### 1. Test Staff Orders:

```bash
# Login as staff
# Navigate to /staff/orders
# Kiểm tra:
✅ Hiển thị đơn hàng từ database
✅ Search hoạt động
✅ Filter theo status hoạt động
✅ Quick stats đếm đúng
✅ Update status hoạt động
✅ Xem chi tiết đơn hàng
```

### 2. Test Admin Orders:

```bash
# Login as admin
# Navigate to /admin/orders
# Kiểm tra:
✅ Hiển thị đơn hàng từ database
✅ Search hoạt động
✅ Filter theo status hoạt động
✅ Sort hoạt động (Mới nhất, Cũ nhất, Giá trị, Khách hàng)
✅ Stats đếm đúng
✅ Update status hoạt động
```

## 🔧 **API Endpoint:**

```javascript
// services/api.js
orderAPI.getAllOrders({
  page: 1,
  limit: 100,
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "pending", // optional
  userId: 3, // optional
});

// Backend: GET /api/orders
```

## 📝 **Features:**

### Staff Orders:

- ✅ Load orders from API
- ✅ Card-based layout với full details
- ✅ Search by order number, customer name, email, phone
- ✅ Filter by status
- ✅ Quick stats (pending, processing, shipping, delivered)
- ✅ Update status flow (pending → processing → shipping → delivered)
- ✅ Cancel orders
- ✅ View full shipping address
- ✅ View order items

### Admin Orders:

- ✅ Load orders from API
- ✅ Table layout compact
- ✅ Search by order number, customer, email
- ✅ Filter by status
- ✅ Sort by date, price, customer
- ✅ Stats (total, pending, processing, completed, revenue)
- ✅ Quick actions (view, process, ship, cancel)

## ✅ **Status: FIXED** 🎉

Staff và Admin giờ có thể xem và quản lý đơn hàng thực tế từ database!
