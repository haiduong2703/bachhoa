# Hướng dẫn Tích hợp VNPAY - Memory Lane

## Tổng quan

Hệ thống đã được tích hợp thanh toán VNPAY hoàn chỉnh với các tính năng:

- Tạo đơn hàng và thanh toán qua VNPAY
- Xác thực chữ ký HMAC-SHA512
- Xử lý callback từ VNPAY (IPN & Return URL)
- Tự động cập nhật trạng thái đơn hàng sau thanh toán
- Giao diện thanh toán thành công/thất bại

## Cấu trúc Files

### Backend

- `backend/src/routes/vnpay.js` - Router xử lý VNPAY
- `backend/src/models/Order.js` - Model đơn hàng (đã đổi prefix ML)
- `backend/.env.example` - Cấu hình biến môi trường

### Frontend

- `frontend/src/pages/public/CheckoutPage.jsx` - Trang thanh toán với VNPAY
- `frontend/src/pages/public/PaymentSuccess.jsx` - Trang thanh toán thành công
- `frontend/src/pages/public/PaymentFailure.jsx` - Trang thanh toán thất bại
- `frontend/src/services/api.js` - API client (đã thêm createOrderWithVNPay)
- `frontend/src/App.jsx` - Routes (đã thêm /payment/success & /payment/failure)

## Cấu hình Backend

### 1. Cập nhật file `.env`

Thêm các biến sau vào `backend/.env`:

```bash
# VNPAY Configuration
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/api/v1/vnpay/vnpay_return
VNPAY_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction

# Frontend URL (để redirect sau thanh toán)
FRONTEND_URL=http://localhost:3000
```

**Lưu ý:**

- `VNPAY_TMN_CODE`: Mã merchant từ VNPAY cung cấp
- `VNPAY_HASH_SECRET`: Secret key để tạo chữ ký
- `VNPAY_RETURN_URL`: URL backend xử lý callback (phải match với cấu hình trên VNPAY dashboard)
- Môi trường sandbox: dùng URL sandbox như trên
- Môi trường production: đổi sang URL production của VNPAY

### 2. Cài đặt dependencies

```bash
cd backend
npm install moment qs
```

## API Endpoints

### 1. Tạo đơn hàng và thanh toán VNPAY

**POST** `/api/v1/vnpay/create_order_payment`

**Request Body:**

```json
{
  "customerName": "Nguyễn Văn A",
  "customerEmail": "customer@example.com",
  "customerPhone": "0123456789",
  "shippingAddress": {
    "addressLine1": "123 Đường ABC",
    "ward": "Phường XYZ",
    "district": "Quận 1",
    "city": "TP.HCM"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 50000
    }
  ],
  "subtotal": 100000,
  "shippingFee": 30000,
  "total": 130000,
  "notes": "Giao hàng buổi sáng",
  "discountAmount": 0,
  "language": "vn",
  "bankCode": ""
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Đơn hàng được tạo thành công",
  "data": {
    "order": {
      "id": 1,
      "orderNumber": "ML1730419200123",
      "status": "pending",
      "paymentStatus": "unpaid",
      "paymentMethod": "vnpay",
      "totalAmount": 130000,
      ...
    },
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=13000000&..."
  }
}
```

### 2. VNPAY Return (GET)

**GET** `/api/v1/vnpay/vnpay_return`

Endpoint này được VNPAY gọi sau khi khách hàng thanh toán. Tự động:

- Xác thực chữ ký
- Cập nhật `paymentStatus = 'paid'` nếu thành công
- Redirect về frontend: `/payment/success?order={orderNumber}` hoặc `/payment/failure?code={errorCode}`

### 3. VNPAY IPN (POST)

**POST** `/api/v1/vnpay/vnpay_ipn`

Endpoint server-to-server để VNPAY gửi thông báo. Trả về JSON:

```json
{
  "RspCode": "00",
  "Message": "Success"
}
```

## Cách sử dụng trong Frontend

### 1. Checkout Flow

```jsx
// Trong CheckoutPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();

  const orderData = {
    customerName: "...",
    customerEmail: "...",
    // ... các fields khác
    paymentMethod: "vnpay", // hoặc 'cod'
  };

  if (formData.paymentMethod === "vnpay") {
    // Tạo order + nhận payment URL
    const response = await orderAPI.createOrderWithVNPay(orderData);

    // Clear cart và redirect đến VNPAY
    clearCart();
    window.location.href = response.data.paymentUrl;
  } else {
    // COD flow như bình thường
    await orderAPI.createOrder(orderData);
    // ...
  }
};
```

### 2. Payment Success/Failure Pages

Sau khi thanh toán:

- **Thành công**: User được redirect về `/payment/success?order=ML123...`
  - Hiển thị thông báo thành công
  - Countdown 10 giây rồi tự động chuyển về `/customer/orders`
- **Thất bại**: User được redirect về `/payment/failure?code=24`
  - Hiển thị lỗi với mã lỗi VNPAY
  - Countdown 15 giây rồi tự động chuyển về `/cart`

## Mã đơn hàng (Order Number)

Đã đổi prefix từ `BH` (Bach Hoa) sang `ML` (Memory Lane):

- Format: `ML{timestamp}{random3digits}`
- Ví dụ: `ML1730419200456`
- Được tạo tự động trong `Order.js` hook `beforeCreate`

## Testing Flow

### 1. Môi trường Sandbox

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 2. Test Checkout với VNPAY

1. Thêm sản phẩm vào giỏ hàng
2. Vào trang `/checkout`
3. Điền thông tin khách hàng và địa chỉ
4. Chọn "Thanh toán qua VNPAY"
5. Click "Đặt hàng"
6. Được redirect đến VNPAY sandbox
7. Sử dụng thẻ test của VNPAY:
   - Ngân hàng: NCB
   - Số thẻ: 9704198526191432198
   - Tên: NGUYEN VAN A
   - Ngày phát hành: 07/15
   - Mật khẩu OTP: 123456

### 3. Kiểm tra kết quả

- Sau khi thanh toán thành công trên VNPAY
- Được redirect về `/payment/success`
- Kiểm tra database: `order.paymentStatus` đã chuyển sang `'paid'`
- Kiểm tra `/customer/orders` để xem đơn hàng

## Mã lỗi VNPAY thường gặp

| Mã lỗi | Ý nghĩa                           |
| ------ | --------------------------------- |
| 00     | Thành công                        |
| 07     | Giao dịch nghi ngờ gian lận       |
| 09     | Thẻ chưa đăng ký Internet Banking |
| 11     | Hết hạn chờ thanh toán            |
| 12     | Thẻ bị khóa                       |
| 13     | Sai mật khẩu OTP                  |
| 24     | Khách hàng hủy giao dịch          |
| 51     | Tài khoản không đủ số dư          |
| 65     | Vượt hạn mức giao dịch            |
| 75     | Ngân hàng bảo trì                 |
| 99     | Lỗi không xác định                |

## Troubleshooting

### 1. Lỗi "Checksum failed"

- Kiểm tra `VNPAY_HASH_SECRET` đúng chưa
- Đảm bảo params được sắp xếp đúng thứ tự
- Kiểm tra encoding (UTF-8)

### 2. Redirect không hoạt động

- Kiểm tra `VNPAY_RETURN_URL` trong .env
- Đảm bảo URL match với config trên VNPAY dashboard
- Kiểm tra `FRONTEND_URL` đã set chưa

### 3. Order không cập nhật trạng thái

- Kiểm tra IPN endpoint có public access không
- Xem logs backend khi VNPAY gọi IPN
- Verify `orderNumber` trong DB match với `vnp_TxnRef`

### 4. Lỗi CORS khi gọi API

- Đảm bảo `CORS_ORIGIN` trong backend .env bao gồm frontend URL
- Check preflight requests trong Network tab

## Nâng cấp lên Production

### 1. Đổi URLs

```bash
# Production VNPAY
VNPAY_URL=https://vnpay.vn/paymentv2/vpcpay.html
VNPAY_API=https://vnpay.vn/merchant_webapi/api/transaction

# Production domain
VNPAY_RETURN_URL=https://yourdomain.com/api/v1/vnpay/vnpay_return
FRONTEND_URL=https://yourdomain.com
```

### 2. Bảo mật

- Whitelist IP của VNPAY cho IPN endpoint
- Enable HTTPS
- Validate webhook signatures
- Rate limiting cho endpoints

### 3. Logging & Monitoring

- Log tất cả transactions
- Monitor IPN failures
- Alert khi có lỗi thanh toán
- Track conversion rate

## Support

Tài liệu VNPAY: https://sandbox.vnpayment.vn/apis/docs/huong-dan-tich-hop/

Liên hệ support VNPAY: support@vnpay.vn
