# 🚀 Quick Testing Guide - LaundryEase Backend

## Step 1: Start the Server

### Option A: Use the batch file
```bash
# Double-click this file in Windows Explorer:
start_server.bat
```

### Option B: Manual start
```bash
cd "d:\sem 6\laundry_ease_backend"
npm install
npm start
```

### Option C: Direct node command
```bash
cd "d:\sem 6\laundry_ease_backend"
node src/server.js
```

**Expected Output:**
```
Server running in development mode on port 5000
MongoDB Connected: <connection_string>
```

---

## Step 2: Import Postman Collection

1. **Open Postman**
2. **Click Import** (top left)
3. **Select File** → Choose `LaundryEase_API_Collection.postman_collection.json`
4. **Import** → Collection will appear in left sidebar

---

## Step 3: Test Basic Connectivity

### Quick Health Check
```
GET http://localhost:5000/
```
**Expected Response:**
```json
{
  "message": "Welcome to LaundryEase API"
}
```

---

## Step 4: Run Complete Test Sequence

### 🔥 **AUTOMATED TESTING SEQUENCE** (Run in this order):

1. **Authentication** 📝
   - Register User
   - Register Admin
   - Login User (saves token automatically)
   - Login Admin (saves token automatically)

2. **Services Setup** 🧺
   - Create Service - Wash & Dry (saves service ID)
   - Create Service - Premium
   - Get All Services

3. **Order Management** 📦
   - Create Order (saves order ID automatically)
   - Get Order History
   - Get Order by ID

4. **Khalti Payment Testing** 💳
   - Get Khalti Config
   - **Initiate Khalti Payment** (saves pidx automatically)
   - Copy the `payment_url` from response
   - **Open payment_url in browser**
   - **Complete payment with test credentials:**
     - Khalti ID: `9800000000`
     - MPIN: `1111`
     - OTP: `987654`
   - **Verify Khalti Payment** (uses saved pidx)

5. **Notifications Check** 🔔
   - Get User Notifications (should show payment notification)
   - Get Unread Count
   - Mark All as Read

6. **Admin Operations** 👨‍💼
   - Get Dashboard Stats
   - Get All Orders
   - Update Order Status
   - Get All Users
   - Get Payment History

---

## Step 5: Manual Khalti Testing

### 🧪 **Khalti Sandbox Testing Process:**

1. **Run "Initiate Khalti Payment"** in Postman
2. **Copy the `payment_url`** from response
3. **Open URL in browser** (e.g., `https://test-pay.khalti.com/?pidx=xxx`)
4. **Use test credentials:**
   - **Khalti ID:** 9800000000
   - **MPIN:** 1111
   - **OTP:** 987654
5. **Complete payment** on Khalti portal
6. **Run "Verify Khalti Payment"** in Postman
7. **Check notifications** for payment confirmation

---

## 📊 Expected Results

### After Successful Payment:
- ✅ Payment status: `completed`
- ✅ Order status: `confirmed`
- ✅ Notification sent to user
- ✅ Payment record created
- ✅ Order payment details updated

### Notification Example:
```json
{
  "success": true,
  "data": [
    {
      "_id": "notification_id",
      "message": "Your payment for order #order_id was successful. Thank you!",
      "type": "payment",
      "read": false,
      "createdAt": "2024-12-25T10:30:00Z"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **Server won't start:**
   ```bash
   # Check if port 5000 is busy
   netstat -ano | findstr :5000
   # Kill process if needed
   taskkill /PID <pid> /F
   ```

2. **MongoDB connection error:**
   ```bash
   # Start MongoDB service
   net start MongoDB
   ```

3. **Environment variables not loaded:**
   - Check `.env` file exists
   - Verify all required variables are set

4. **Postman collection variables not working:**
   - Check if tokens are saved in collection variables
   - Re-run login requests if tokens expired

5. **Khalti payment fails:**
   - Verify KHALTI_SECRET_KEY in .env
   - Use correct test credentials
   - Check network connectivity

---

## 🎯 Production Readiness Checklist

### Before Production Deployment:

- [ ] **Environment Variables:**
  - [ ] Production MongoDB URI
  - [ ] Production Khalti keys
  - [ ] Secure JWT secret
  - [ ] Production email credentials
  - [ ] Production frontend URL

- [ ] **Security:**
  - [ ] CORS configuration for production
  - [ ] Rate limiting implemented
  - [ ] Input validation on all endpoints
  - [ ] Error logging configured

- [ ] **Testing:**
  - [ ] All endpoints tested
  - [ ] Khalti integration verified
  - [ ] Notification system working
  - [ ] Admin operations tested
  - [ ] Error handling verified

- [ ] **Performance:**
  - [ ] Database indexes optimized
  - [ ] Response times acceptable
  - [ ] Memory usage monitored

---

## 📱 Frontend Integration Notes

### For Flutter App Integration:

1. **API Base URL:** `http://localhost:5000` (development)
2. **Authentication:** Bearer token in Authorization header
3. **Khalti Integration:** Use `payment_url` to redirect user
4. **Error Handling:** Check `success` field in all responses
5. **Notifications:** Poll `/api/notifications/` endpoint

### Key Endpoints for Flutter:
- **Login:** `POST /api/auth/login`
- **Orders:** `GET /api/orders/history`
- **Payment:** `POST /api/khalti/initiate`
- **Notifications:** `GET /api/notifications/`

---

## 🚀 Start Testing Now!

1. **Double-click `start_server.bat`**
2. **Import Postman collection**
3. **Run the test sequence**
4. **Verify Khalti payment flow**
5. **Check all notifications work**

Your LaundryEase backend is ready for production! 🎉
