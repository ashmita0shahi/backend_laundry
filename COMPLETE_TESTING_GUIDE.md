# Complete API Testing Guide - LaundryEase Backend

## Updated Khalti Integration & Route Fix

### Fixed Issues:
1. **Khalti API**: Updated to use official Khalti ePayment API (KPG-2)
2. **Route Conflict**: Fixed ObjectId cast error for notifications

## Environment Setup

### 1. Environment Variables (.env)
```env
MONGO_URI=mongodb://localhost:27017/laundry_ease
PORT=5000
NODE_ENV=development
KHALTI_PUBLIC_KEY=6de2bdf2e7d7437381a6b0714f26db51
KHALTI_SECRET_KEY=95999338ce264bb0b50ce29ef22f1592
JWT_SECRET=taOUPP5vbIJD+0yuyHpHTV8yd+q2UkPTpZiRnnmxgDx4HqehD1JkvIb8Bi6knM7mJ3eBEl36hENxeXqcAXQscg==
JWT_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ashmita0shahi@gmail.com
EMAIL_PASS=puri dabl uvts nmft
EMAIL_FROM=ashmita0shahi@gmail.com
FRONTEND_URL=http://localhost:3000
```

### 2. Start Server
```bash
cd "d:\sem 6\laundry_ease_backend"
npm install
npm start
```

## Complete API Testing Guide

### 1. Authentication Endpoints

#### Register User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "9841234567",
  "address": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  }
}
```

#### Login User
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Service Endpoints

#### Get All Services
```http
GET http://localhost:5000/api/services
```

#### Create Service (Admin only)
```http
POST http://localhost:5000/api/services
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Wash & Dry",
  "description": "Basic wash and dry service",
  "price": 100,
  "estimatedTime": 24,
  "category": "basic",
  "isActive": true
}
```

### 3. Order Endpoints

#### Create Order
```http
POST http://localhost:5000/api/orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "service": "service_id_here",
      "quantity": 2,
      "price": 100
    }
  ],
  "pickupAddress": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  },
  "deliveryAddress": {
    "street": "456 Oak Ave",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  },
  "pickupTime": "2024-01-15T10:00:00Z",
  "deliveryTime": "2024-01-16T18:00:00Z",
  "specialInstructions": "Handle with care"
}
```

#### Get Order History
```http
GET http://localhost:5000/api/orders/history
Authorization: Bearer <user_token>
```

#### Get Order by ID
```http
GET http://localhost:5000/api/orders/{order_id}
Authorization: Bearer <user_token>
```

#### Update Order Status (Admin only)
```http
PUT http://localhost:5000/api/orders/{order_id}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed",
  "note": "Order confirmed and processing"
}
```

### 4. Payment Endpoints (Updated)

#### Initiate Payment
```http
POST http://localhost:5000/api/payments/initiate
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "orderId": "order_id_here",
  "paymentMethod": "khalti"
}
```

#### Verify Payment (New API)
```http
POST http://localhost:5000/api/payments/verify
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "pidx": "payment_identifier_from_khalti",
  "orderId": "order_id_here"
}
```

**Note:** Use `pidx` (not `token`) and `orderId` (not `paymentId`) for the new Khalti API.

#### Get Payment History
```http
GET http://localhost:5000/api/payments/history
Authorization: Bearer <user_token>
```

### 5. Khalti Endpoints (Updated)

#### Initiate Khalti Payment
```http
POST http://localhost:5000/api/khalti/initiate
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "orderId": "order_id_here"
}
```

#### Verify Khalti Payment
```http
POST http://localhost:5000/api/khalti/verify
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "pidx": "payment_identifier",
  "orderId": "order_id_here"
}
```

#### Get Khalti Config
```http
GET http://localhost:5000/api/khalti/config
```

### 6. Notification Endpoints (Fixed URLs)

#### Get User Notifications
```http
GET http://localhost:5000/api/notifications/
Authorization: Bearer <user_token>
```

#### Get Unread Count
```http
GET http://localhost:5000/api/notifications/unread-count
Authorization: Bearer <user_token>
```

#### Mark Notification as Read
```http
PUT http://localhost:5000/api/notifications/{notification_id}/read
Authorization: Bearer <user_token>
```

#### Mark All Notifications as Read
```http
PUT http://localhost:5000/api/notifications/mark-all-read
Authorization: Bearer <user_token>
```

### 7. User Management Endpoints

#### Get User Profile
```http
GET http://localhost:5000/api/users/profile
Authorization: Bearer <user_token>
```

#### Update User Profile
```http
PUT http://localhost:5000/api/users/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "9841234567",
  "address": {
    "street": "123 Updated St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "zipCode": "44600"
  }
}
```

#### Get All Users (Admin only)
```http
GET http://localhost:5000/api/users
Authorization: Bearer <admin_token>
```

### 8. Admin Dashboard Endpoints

#### Get Dashboard Stats
```http
GET http://localhost:5000/api/orders/dashboard-stats
Authorization: Bearer <admin_token>
```

#### Get All Orders (Admin)
```http
GET http://localhost:5000/api/orders/admin
Authorization: Bearer <admin_token>
```

## Testing Flow

### 1. Complete Order & Payment Flow
1. **Register/Login** → Get auth token
2. **Create Order** → Get order ID
3. **Initiate Payment** → Get payment URL
4. **Complete Payment** → Use Khalti test credentials
5. **Verify Payment** → Confirm payment status
6. **Check Notifications** → Verify payment notification

### 2. Khalti Test Credentials
- **Test Khalti ID**: 9800000000, 9800000001, 9800000002, 9800000003, 9800000004, 9800000005
- **Test MPIN**: 1111
- **Test OTP**: 987654

### 3. Expected Responses

#### Successful Payment Initiation
```json
{
  "success": true,
  "data": {
    "pidx": "HT6o6PEZRWFJ5ygavzHWd5",
    "payment_url": "https://test-pay.khalti.com/?pidx=HT6o6PEZRWFJ5ygavzHWd5",
    "expires_at": "2024-01-01T12:00:00Z",
    "expires_in": 1800
  }
}
```

#### Successful Payment Verification
```json
{
  "success": true,
  "data": {
    "pidx": "HT6o6PEZRWFJ5ygavzHWd5",
    "total_amount": 1000,
    "status": "Completed",
    "transaction_id": "GFq9PFS7b2iYvL8Lir9oXe",
    "fee": 0,
    "refunded": false
  }
}
```

## Common Issues & Solutions

### 1. Route Conflict Error
**Error**: `CastError: Cast to ObjectId failed for value "notifications"`
**Solution**: Use correct URLs:
- ✅ `/api/notifications/` 
- ❌ `/api/orders/notifications/`

### 2. Khalti Payment Errors
**Error**: "Payment verification failed"
**Solution**: 
- Check if payment was completed on Khalti portal
- Verify pidx is correct
- Use lookup API for verification

### 3. Environment Issues
**Error**: "Invalid token"
**Solution**: 
- Check KHALTI_SECRET_KEY in .env
- Ensure proper Authorization header format

## Next Steps

1. **Test all endpoints** with Postman
2. **Verify Khalti integration** with sandbox
3. **Check notification flow** after payment
4. **Test admin dashboard** features
5. **Prepare for frontend integration**

## Production Checklist

- [ ] Update Khalti keys for production
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Update FRONTEND_URL
- [ ] Set up proper logging
- [ ] Configure CORS for production domain
