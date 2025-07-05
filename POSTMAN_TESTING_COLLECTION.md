# LaundryEase Backend - Complete Postman Testing Collection

## 🚀 Server Setup

**Base URL:** `http://localhost:5000`

**Start Server:** 
```bash
cd "d:\sem 6\laundry_ease_backend"
npm start
# or
node src/server.js
```

---

## 📋 Postman Collection - Step by Step Testing

### 1️⃣ AUTHENTICATION

#### 1.1 Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@test.com",
  "password": "password123",
  "phoneNumber": "9841234567",
  "address": {
    "street": "123 Main Street",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  }
}
```

#### 1.2 Register Admin User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@test.com", 
  "password": "admin123",
  "phoneNumber": "9851234567",
  "role": "admin",
  "address": {
    "street": "456 Admin Street",
    "city": "Kathmandu",
    "state": "Bagmati", 
    "zipCode": "44600"
  }
}
```

#### 1.3 Login User
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@test.com",
  "password": "password123"
}
```

#### 1.4 Login Admin
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**⚠️ IMPORTANT:** Save the `token` from login responses for subsequent requests!

---

### 2️⃣ SERVICES MANAGEMENT

#### 2.1 Create Service (Admin Only)
```
POST http://localhost:5000/api/services
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Wash & Dry",
  "description": "Basic wash and dry service for clothes",
  "price": 150,
  "estimatedTime": 24,
  "category": "basic",
  "isActive": true
}
```

#### 2.2 Create Another Service
```
POST http://localhost:5000/api/services
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "Premium Cleaning",
  "description": "Premium cleaning with fabric softener",
  "price": 250,
  "estimatedTime": 48,
  "category": "premium",
  "isActive": true
}
```

#### 2.3 Get All Services
```
GET http://localhost:5000/api/services
```

---

### 3️⃣ ORDER MANAGEMENT

#### 3.1 Create Order
```
POST http://localhost:5000/api/orders
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "items": [
    {
      "service": "<SERVICE_ID_FROM_STEP_2.1>",
      "quantity": 2,
      "price": 150
    },
    {
      "service": "<SERVICE_ID_FROM_STEP_2.2>", 
      "quantity": 1,
      "price": 250
    }
  ],
  "pickupAddress": {
    "street": "123 Main Street",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  },
  "deliveryAddress": {
    "street": "123 Main Street",
    "city": "Kathmandu", 
    "state": "Bagmati",
    "zipCode": "44600"
  },
  "pickupTime": "2024-12-25T10:00:00Z",
  "deliveryTime": "2024-12-26T18:00:00Z",
  "specialInstructions": "Handle delicate items with care"
}
```

#### 3.2 Get Order History
```
GET http://localhost:5000/api/orders/history
Authorization: Bearer <USER_TOKEN>
```

#### 3.3 Get Order by ID
```
GET http://localhost:5000/api/orders/<ORDER_ID>
Authorization: Bearer <USER_TOKEN>
```

---

### 4️⃣ KHALTI PAYMENT INTEGRATION (NEW API)

#### 4.1 Get Khalti Config
```
GET http://localhost:5000/api/khalti/config
```

#### 4.2 Initiate Khalti Payment
```
POST http://localhost:5000/api/khalti/initiate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "orderId": "<ORDER_ID_FROM_STEP_3.1>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pidx": "bZQLD9wRVWo4CdESSfuSsB",
    "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB",
    "expires_at": "2024-12-25T16:26:16.471649+05:45",
    "expires_in": 1800
  }
}
```

#### 4.3 Alternative: Initiate Payment via Payment Controller
```
POST http://localhost:5000/api/payments/initiate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "orderId": "<ORDER_ID>",
  "paymentMethod": "khalti"
}
```

#### 4.4 Test Payment Verification (Simulate Success)
```
POST http://localhost:5000/api/khalti/verify
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "pidx": "<PIDX_FROM_INITIATE_RESPONSE>",
  "orderId": "<ORDER_ID>"
}
```

#### 4.5 Payment Verification via Payment Controller
```
POST http://localhost:5000/api/payments/verify
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "pidx": "<PIDX_FROM_KHALTI>",
  "orderId": "<ORDER_ID>"
}
```

---

### 5️⃣ CASH ON DELIVERY PAYMENT

#### 5.1 Initiate Cash Payment
```
POST http://localhost:5000/api/payments/initiate
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "orderId": "<ORDER_ID>",
  "paymentMethod": "cash_on_delivery"
}
```

---

### 6️⃣ NOTIFICATIONS SYSTEM

#### 6.1 Get User Notifications
```
GET http://localhost:5000/api/notifications/
Authorization: Bearer <USER_TOKEN>
```

#### 6.2 Get Unread Notifications Count
```
GET http://localhost:5000/api/notifications/unread-count
Authorization: Bearer <USER_TOKEN>
```

#### 6.3 Mark Notification as Read
```
PUT http://localhost:5000/api/notifications/<NOTIFICATION_ID>/read
Authorization: Bearer <USER_TOKEN>
```

#### 6.4 Mark All Notifications as Read
```
PUT http://localhost:5000/api/notifications/mark-all-read
Authorization: Bearer <USER_TOKEN>
```

---

### 7️⃣ USER PROFILE MANAGEMENT

#### 7.1 Get User Profile
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <USER_TOKEN>
```

#### 7.2 Update User Profile
```
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "firstName": "John Updated",
  "lastName": "Doe Updated",
  "phoneNumber": "9841234568",
  "address": {
    "street": "456 Updated Street",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44601"
  }
}
```

---

### 8️⃣ ADMIN ENDPOINTS

#### 8.1 Get Dashboard Stats
```
GET http://localhost:5000/api/orders/dashboard-stats
Authorization: Bearer <ADMIN_TOKEN>
```

#### 8.2 Get All Orders (Admin)
```
GET http://localhost:5000/api/orders/admin
Authorization: Bearer <ADMIN_TOKEN>
```

#### 8.3 Update Order Status
```
PUT http://localhost:5000/api/orders/<ORDER_ID>/status
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "washing",
  "note": "Order is now being processed in washing machine"
}
```

#### 8.4 Get All Users (Admin)
```
GET http://localhost:5000/api/users
Authorization: Bearer <ADMIN_TOKEN>
```

#### 8.5 Get Payment History (Admin)
```
GET http://localhost:5000/api/payments/history
Authorization: Bearer <ADMIN_TOKEN>
```

---

## 🧪 KHALTI SANDBOX TESTING

### Test Credentials
- **Test Khalti IDs:** 9800000000, 9800000001, 9800000002, 9800000003, 9800000004, 9800000005
- **Test MPIN:** 1111
- **Test OTP:** 987654

### Manual Testing Steps for Khalti:
1. **Initiate Payment** (Step 4.2) → Get `payment_url`
2. **Open payment_url** in browser
3. **Use test credentials** to complete payment
4. **Copy the pidx** from the callback URL
5. **Verify payment** (Step 4.4) with the pidx

---

## 📊 EXPECTED RESPONSES

### Successful Order Creation:
```json
{
  "success": true,
  "data": {
    "_id": "order_id_here",
    "user": "user_id",
    "items": [...],
    "totalAmount": 550,
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

### Successful Payment Initiation:
```json
{
  "success": true,
  "data": {
    "payment": {
      "_id": "payment_id",
      "order": "order_id",
      "amount": 550,
      "method": "khalti",
      "status": "processing"
    },
    "khaltiResponse": {
      "pidx": "bZQLD9wRVWo4CdESSfuSsB",
      "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB",
      "expires_at": "2024-12-25T16:26:16Z",
      "expires_in": 1800
    }
  }
}
```

### Successful Payment Verification:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      "status": "completed",
      "transactionId": "GFq9PFS7b2iYvL8Lir9oXe"
    },
    "order": {
      "status": "confirmed",
      "paymentStatus": "completed"
    }
  }
}
```

---

## 🔧 TROUBLESHOOTING

### Common Issues:

1. **Server not starting:**
   ```bash
   npm install
   npm start
   ```

2. **MongoDB connection error:**
   - Check if MongoDB is running
   - Verify MONGO_URI in .env

3. **Token not working:**
   - Use fresh token from login
   - Check Authorization header format: `Bearer <token>`

4. **Order not found:**
   - Use valid ObjectId from order creation response

5. **Payment verification fails:**
   - Ensure payment was completed on Khalti portal
   - Use correct pidx from initiation response

---

## 🚀 TESTING SEQUENCE

### Complete Flow Test:
1. **Register & Login** → Get tokens
2. **Create Services** (Admin)
3. **Create Order** → Get order ID
4. **Initiate Payment** → Get payment URL
5. **Complete Payment** → Use Khalti sandbox
6. **Verify Payment** → Check order status
7. **Check Notifications** → Verify payment notification
8. **Update Order Status** (Admin) → Test workflow
9. **Check Payment History** → Verify records

This comprehensive testing guide covers all endpoints with exact payloads. Start the server and follow the sequence step by step!
