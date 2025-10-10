# 🔧 Fix: API Proxy Configuration

## 🐛 **Vấn Đề**

Frontend đang gọi API với URL:
```
http://localhost:3000/api/v1/reviews/my-reviews
```

Nhưng **không có proxy configuration** → Vite dev server trả về HTML thay vì forward request đến backend.

### **Nguyên Nhân:**

```
Frontend (port 3000)
↓
Call: fetch('/api/v1/reviews/my-reviews')
↓
Vite tries: http://localhost:3000/api/v1/reviews/my-reviews
↓
❌ No API server on port 3000
↓
Vite returns: index.html (fallback for SPA routing)
↓
Result: HTML instead of JSON
```

---

## ✅ **Giải Pháp**

### **File: `frontend/vite.config.js`**

**Before ❌:**
```javascript
server: {
  port: 3000,
  host: true,
},
```

**After ✅:**
```javascript
server: {
  port: 3000,
  host: true,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
},
```

---

## 🔄 **How It Works Now**

```
Frontend (port 3000)
↓
Call: fetch('/api/v1/reviews/my-reviews')
↓
Vite proxy intercepts: /api/*
↓
Forward to: http://localhost:5000/api/v1/reviews/my-reviews
↓
Backend (port 5000) processes request
↓
Returns: JSON { "status": "success", "data": {...} }
↓
Vite forwards response to frontend
↓
Frontend receives JSON ✅
```

---

## 📋 **Proxy Configuration Explained**

### **target:**
```javascript
target: 'http://localhost:5000'
```
- Backend API server địa chỉ
- Tất cả requests bắt đầu với `/api` sẽ được forward đến đây

### **changeOrigin:**
```javascript
changeOrigin: true
```
- Changes the origin of the host header to the target URL
- Required for virtual hosted sites
- Prevents CORS issues

### **secure:**
```javascript
secure: false
```
- Accepts self-signed certificates
- Set to `false` for development
- Set to `true` for production HTTPS

---

## 🚀 **Restart Frontend Server**

**IMPORTANT:** Vite config changes require restart!

### **Step 1: Stop Current Server**
```bash
# Press Ctrl+C in terminal running frontend
```

### **Step 2: Start Again**
```bash
cd frontend
npm run dev
```

### **Step 3: Verify**
```bash
# Open browser DevTools > Network
# Navigate to any page that calls API
# Check requests:

Before:
❌ http://localhost:3000/api/v1/reviews/my-reviews → HTML (404)

After:
✅ http://localhost:3000/api/v1/reviews/my-reviews → Proxied to localhost:5000 → JSON
```

---

## 🧪 **Testing**

### **Test 1: Check Proxy in DevTools**

1. Open http://localhost:3000
2. Open DevTools (F12) → Network tab
3. Navigate to page that calls API (e.g., /customer/reviews)
4. Check network requests:

**Request:**
```
GET http://localhost:3000/api/v1/reviews/my-reviews
```

**Response Headers:**
```
Content-Type: application/json  ← Should be JSON, not HTML!
```

**Response Body:**
```json
{
  "status": "success",
  "data": {
    "reviews": [...]
  }
}
```

### **Test 2: Check Console for Errors**

**Before (with error):**
```
SyntaxError: Unexpected token '<' in JSON at position 0
```

**After (working):**
```
✅ No errors
✅ Data loads successfully
```

---

## 📊 **API Call Flow**

### **Development Environment:**

```
┌─────────────────┐
│   Browser       │
│  (localhost)    │
└────────┬────────┘
         │ fetch('/api/v1/reviews/my-reviews')
         ↓
┌─────────────────┐
│  Vite Server    │
│  Port: 3000     │
│                 │
│  Proxy Config:  │
│  /api → :5000   │
└────────┬────────┘
         │ Forward
         ↓
┌─────────────────┐
│  Backend API    │
│  Port: 5000     │
│  Express Server │
└─────────────────┘
```

### **Production Environment:**

```
┌─────────────────┐
│   Browser       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Nginx/Apache   │
│  Reverse Proxy  │
│  /api → backend │
└─────────────────┘
```

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: Still Getting HTML**

**Cause:** Vite server not restarted

**Solution:**
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

### **Issue 2: CORS Errors**

**Cause:** Backend doesn't allow requests from localhost:3000

**Solution:** Check backend CORS config
```javascript
// backend/src/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))
```

### **Issue 3: 404 on API Calls**

**Cause:** Backend server not running

**Solution:**
```bash
cd backend
npm run dev
```

Check backend is running:
```bash
# Should return JSON
curl http://localhost:5000/api/v1/health
```

### **Issue 4: Proxy Not Working**

**Cause:** Wrong proxy path pattern

**Check:**
```javascript
// vite.config.js
proxy: {
  '/api': {  // ✅ Matches /api/v1/...
    target: 'http://localhost:5000'
  }
}

// API calls must start with /api
fetch('/api/v1/reviews')  // ✅ Will be proxied
fetch('/reviews')         // ❌ Will NOT be proxied
```

---

## 📝 **Environment Ports**

### **Development:**
```
Frontend: http://localhost:3000 (Vite)
Backend:  http://localhost:5000 (Express)
MySQL:    localhost:3306
```

### **API Calls in Code:**
```javascript
// ✅ Correct - Relative path
fetch('/api/v1/reviews/my-reviews')

// ❌ Wrong - Absolute URL
fetch('http://localhost:5000/api/v1/reviews/my-reviews')

// ✅ Also correct with full URL (but proxy is cleaner)
fetch('http://localhost:5000/api/v1/reviews/my-reviews')
```

---

## 🎯 **Best Practices**

### **1. Use Relative Paths:**
```javascript
// ✅ Good - Works in dev and production
const response = await fetch('/api/v1/reviews/my-reviews')

// ❌ Bad - Hardcoded port, won't work in production
const response = await fetch('http://localhost:5000/api/v1/reviews/my-reviews')
```

### **2. Environment Variables:**
```javascript
// vite.config.js
const API_TARGET = process.env.VITE_API_URL || 'http://localhost:5000'

server: {
  proxy: {
    '/api': {
      target: API_TARGET
    }
  }
}
```

### **3. Multiple Proxy Rules:**
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  '/uploads': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  '/socket.io': {
    target: 'http://localhost:5000',
    ws: true,  // Enable WebSocket proxy
  }
}
```

---

## 📋 **Checklist**

- ✅ Added proxy config to vite.config.js
- ✅ Proxy target points to backend port (5000)
- ✅ changeOrigin set to true
- ✅ Restart frontend server
- ✅ Backend server running on port 5000
- ✅ Test API calls in DevTools
- ✅ Verify JSON responses (not HTML)
- ✅ No CORS errors in console
- ✅ No "Unexpected token '<'" errors

---

## 🎉 **Summary**

### **Problem:**
- ❌ Frontend calling API at http://localhost:3000/api/...
- ❌ No proxy → Vite returns HTML
- ❌ Frontend can't parse HTML as JSON

### **Solution:**
- ✅ Added Vite proxy configuration
- ✅ All `/api/*` requests forwarded to `http://localhost:5000`
- ✅ Backend processes requests and returns JSON
- ✅ Frontend receives correct JSON responses

### **Key Change:**
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

**Remember to restart frontend server after config change!** 🚀

---

**🎊 Proxy Configuration Complete!** 🎊
