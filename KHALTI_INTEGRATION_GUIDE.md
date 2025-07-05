# Khalti Payment Integration Guide

## Overview
This guide covers the updated Khalti payment integration using the latest Khalti ePayment API (KPG-2).

## Changes Made

### 1. Updated Khalti Helper (`src/utils/khaltiHelper.js`)
- **OLD**: Used deprecated widget-based API
- **NEW**: Uses official Khalti ePayment API endpoints
- **Endpoints**: 
  - `POST /epayment/initiate/` - Initiate payment
  - `POST /epayment/lookup/` - Verify payment

### 2. Updated Payment Controller (`src/controllers/paymentController.js`)
- Added `initiatePayment` function with new API integration
- Updated `verifyPayment` to use `pidx` instead of `token`
- Added `handleKhaltiCallback` for payment completion

### 3. Updated Routes
- **Khalti Routes** (`src/routes/khalti.js`):
  - `POST /api/khalti/initiate` - Initiate payment
  - `POST /api/khalti/verify` - Verify payment
  - `GET /api/khalti/callback` - Handle payment callback
  - `GET /api/khalti/config` - Get configuration
  
- **Payment Routes** (`src/routes/payments.js`):
  - Added `GET /api/payments/khalti/callback` endpoint

## API Usage

### 1. Initiate Payment
```bash
POST /api/khalti/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pidx": "payment_identifier",
    "payment_url": "https://test-pay.khalti.com/?pidx=xxx",
    "expires_at": "2024-01-01T12:00:00Z",
    "expires_in": 1800
  }
}
```

### 2. Verify Payment
```bash
POST /api/khalti/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "pidx": "payment_identifier",
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pidx": "payment_identifier",
    "total_amount": 1000,
    "status": "Completed",
    "transaction_id": "transaction_id",
    "fee": 0,
    "refunded": false
  }
}
```

## Frontend Integration

### 1. Payment Flow
1. User clicks "Pay with Khalti"
2. Frontend calls `/api/khalti/initiate`
3. Redirect user to `payment_url` from response
4. User completes payment on Khalti portal
5. Khalti redirects back to your return URL with payment info
6. Frontend calls `/api/khalti/verify` with `pidx`
7. Backend verifies payment and updates order status

### 2. Required Environment Variables
```env
KHALTI_PUBLIC_KEY=your_public_key
KHALTI_SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:3000
```

## Testing with Postman

### Test Credentials (Sandbox)
- **Test Khalti ID**: 9800000000, 9800000001, 9800000002, 9800000003, 9800000004, 9800000005
- **Test MPIN**: 1111
- **Test OTP**: 987654

### Test Flow
1. **Create an order first**
2. **Initiate payment** with order ID
3. **Use payment_url** to complete payment manually
4. **Verify payment** with returned pidx

## Error Handling

### Common Errors and Solutions

1. **"Payment identifier (pidx) is required"**
   - Ensure you're sending `pidx` in verification request

2. **"Order not found"**
   - Verify order ID exists and is accessible by the user

3. **"Payment verification failed"**
   - Check if payment was actually completed on Khalti portal
   - Verify pidx is correct

4. **"Invalid token" (401)**
   - Check if KHALTI_SECRET_KEY is correct
   - Ensure Authorization header format: `Key <secret_key>`

## Route Conflict Fix

### Issue
The error "CastError: Cast to ObjectId failed for value 'notifications'" occurs when accessing `/api/orders/notifications/` instead of `/api/notifications/`.

### Solution
Use the correct endpoints:
- **Notifications**: `/api/notifications/`
- **Orders**: `/api/orders/`

### Correct URLs
```
GET /api/notifications/           - Get user notifications
GET /api/notifications/unread-count - Get unread count
PUT /api/notifications/:id/read   - Mark as read
PUT /api/notifications/mark-all-read - Mark all as read
```

## Status Reference

### Payment Status Values
- `Completed` - Payment successful
- `Pending` - Payment in progress
- `Expired` - Payment link expired
- `User canceled` - User cancelled payment
- `Refunded` - Payment refunded

### Order Status Updates
- Payment successful → Order status: `confirmed`
- Payment failed → Order status remains `pending`
- Notification sent to user on payment completion

## Production Considerations

1. **Environment Variables**
   - Use production Khalti keys
   - Set NODE_ENV=production
   - Update FRONTEND_URL to production URL

2. **Security**
   - Always verify payments using lookup API
   - Never trust frontend-only payment confirmations
   - Log all payment attempts for auditing

3. **Error Handling**
   - Implement proper retry mechanisms
   - Handle network timeouts gracefully
   - Provide user-friendly error messages

## Support

For issues with Khalti integration:
1. Check the official docs: https://docs.khalti.com/khalti-epayment/
2. Verify environment variables are set correctly
3. Test with sandbox credentials first
4. Check server logs for detailed error messages
