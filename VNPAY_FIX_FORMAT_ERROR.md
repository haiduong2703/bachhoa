# Fix Lỗi "Dữ liệu gửi sang không đúng định dạng" - VNPAY

## 🔧 Các sửa đổi đã thực hiện:

### 1. **Function `sortObject()` - Không encode trong function**

```javascript
// ❌ TRƯỚC (SAI - encode 2 lần)
function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key)); // ❌ Encode key
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(String(obj[str[key]])).replace(
      /%20/g,
      "+"
    ); // ❌ Encode value
  }
  return sorted;
}

// ✅ SAU (ĐÚNG - chỉ sort, không encode)
function sortObject(obj) {
  const sorted = {};
  const str = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(key); // ✅ Không encode
    }
  }
  str.sort();
  for (let key = 0; key < str.length; key++) {
    sorted[str[key]] = obj[str[key]]; // ✅ Không encode
  }
  return sorted;
}
```

### 2. **Tất cả giá trị params phải là STRING**

```javascript
// ❌ TRƯỚC (SAI)
vnp_Params["vnp_Amount"] = Math.round(amount * 100); // ❌ Number

// ✅ SAU (ĐÚNG)
vnp_Params["vnp_Amount"] = String(Math.round(amount * 100)); // ✅ String
```

### 3. **Build URL đúng cách**

```javascript
// Bước 1: Sort params
vnp_Params = sortObject(vnp_Params);

// Bước 2: Tạo sign data (KHÔNG encode)
const signData = querystring.stringify(vnp_Params, { encode: false });

// Bước 3: Tạo signature
const hmac = crypto.createHmac("sha512", secretKey);
const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
vnp_Params["vnp_SecureHash"] = signed;

// Bước 4: Tạo URL (CÓ encode)
const paymentUrl =
  vnpUrl + "?" + querystring.stringify(vnp_Params, { encode: true });
```

## 📋 Nguyên tắc VNPAY:

| Bước                | Encoding | Ghi chú                      |
| ------------------- | -------- | ---------------------------- |
| 1. Sort params      | ❌ KHÔNG | Chỉ sắp xếp alphabet         |
| 2. Sign data        | ❌ KHÔNG | Raw values để tạo signature  |
| 3. Create signature | N/A      | HMAC SHA512                  |
| 4. Final URL        | ✅ CÓ    | Encode để browser xử lý đúng |

## 🎯 Các lỗi thường gặp:

### ❌ Lỗi 1: "Dữ liệu gửi sang không đúng định dạng"

**Nguyên nhân:**

- Encode params 2 lần (trong sortObject + trong querystring)
- Giá trị params là Number thay vì String
- URL không được encode đúng

**Giải pháp:** ✅ Đã fix ở trên

### ❌ Lỗi 2: "Sai chữ ký"

**Nguyên nhân:**

- Sign data bị encode
- Thứ tự params không đúng alphabet

**Giải pháp:**

- Sign data PHẢI dùng `encode: false`
- Sort params trước khi tạo sign data

### ❌ Lỗi 3: "Không tìm thấy website"

**Nguyên nhân:**

- ReturnUrl không khớp với merchant portal
- Domain chưa được whitelist

**Giải pháp:**

- Dùng `http://localhost:5000/api/v1/vnpay/vnpay_return` cho test
- Production: đăng ký domain với VNPAY

## 🚀 Test lại:

```bash
# 1. Restart backend
npm run dev

# 2. Tạo order mới với VNPAY
# 3. Check logs xem format có đúng không
```

## ✅ Expected logs:

```
=== VNPAY DEBUG ===
Order number: ML1730502000123
Amount: 3800000
Sign data: vnp_Amount=3800000&vnp_Command=pay&vnp_CreateDate=20251102123000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh toan don hang ML1730502000123&vnp_OrderType=other&vnp_ReturnUrl=http://localhost:5000/api/v1/vnpay/vnpay_return&vnp_TmnCode=3NZXFFP99&vnp_TxnRef=ML1730502000123&vnp_Version=2.1.0
Signature: abc123...
===================
```

**Lưu ý:** Sign data KHÔNG có ký tự đặc biệt được encode (như %20, %3A, etc.)

## 📝 Checklist:

- [x] sortObject() không encode
- [x] Tất cả params values là String
- [x] Sign data dùng `encode: false`
- [x] Final URL dùng `encode: true`
- [x] ReturnUrl đúng với môi trường test
- [x] TmnCode và HashSecret đúng

Done! ✅
