# LaundryEase Integration Testing Guide

## Overview
This guide provides comprehensive testing instructions for the complete LaundryEase system, including both the backend API and Flutter mobile application.

## Prerequisites
1. **Backend Requirements**:
   - Node.js (v16 or higher)
   - MongoDB (running on localhost:27017)
   - npm installed

2. **Frontend Requirements**:
   - Flutter SDK (v3.0 or higher)
   - Android Studio or VS Code with Flutter extension
   - Android/iOS emulator or physical device

## Step-by-Step Integration Testing

### 1. Backend Setup and Testing

1. **Navigate to backend directory**:
   ```bash
   cd laundry_ease_backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env` (if exists)
   - Update `.env` with your MongoDB URI and other configurations

4. **Start the backend server**:
   ```bash
   npm start
   ```
   - Server should start on `http://localhost:5000`
   - Check console for "Server running in development mode on port 5000"

5. **Verify backend API**:
   ```bash
   curl http://localhost:5000/api/auth/test
   ```

### 2. Flutter App Setup and Testing

1. **Navigate to mobile app directory**:
   ```bash
   cd laundry_ease_mobile
   ```

2. **Install Flutter dependencies**:
   ```bash
   flutter pub get
   ```

3. **Run Flutter doctor**:
   ```bash
   flutter doctor
   ```
   - Ensure all checkmarks are green

4. **Analyze code**:
   ```bash
   flutter analyze
   ```

5. **Run tests**:
   ```bash
   flutter test
   ```

6. **Start an emulator** (Android Studio):
   - Open Android Studio
   - Start AVD Manager
   - Launch an Android emulator

7. **Run the Flutter app**:
   ```bash
   flutter run
   ```

### 3. End-to-End Testing Scenarios

#### Scenario 1: User Registration and Login
1. **Backend**: Start server on port 5000
2. **Mobile**: Open app on emulator
3. **Test Flow**:
   - App should show splash screen
   - Navigate to login screen
   - Tap "Register" to go to registration
   - Fill registration form with valid data
   - Submit registration (should call `POST /api/auth/register`)
   - Verify success and automatic login
   - Check if dashboard loads with user data

#### Scenario 2: Service Browsing and Order Creation
1. **Test Flow**:
   - Login with valid credentials
   - Navigate to Services tab
   - Browse available services (calls `GET /api/services`)
   - Select a service and items
   - Create new order (calls `POST /api/orders`)
   - Verify order appears in dashboard and order history

#### Scenario 3: Payment Integration
1. **Test Flow**:
   - Create an order
   - Navigate to payment screen
   - Initiate Khalti payment (calls `POST /api/payments/initiate`)
   - Complete payment flow
   - Verify payment success (calls `POST /api/payments/verify`)

#### Scenario 4: Order Tracking
1. **Test Flow**:
   - Create and pay for an order
   - View order details
   - Check order status updates
   - Verify real-time notifications

### 4. API Endpoint Testing

Use the provided Postman collection or test manually:

#### Authentication Endpoints
```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "Test Address"
}

# Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Service Endpoints
```bash
# Get all services
GET http://localhost:5000/api/services

# Get service items
GET http://localhost:5000/api/services/{serviceId}/items
```

#### Order Endpoints
```bash
# Create order
POST http://localhost:5000/api/orders
Authorization: Bearer {token}
Content-Type: application/json
{
  "serviceId": "serviceId",
  "items": [
    {
      "name": "Shirt",
      "category": "clothing",
      "quantity": 2,
      "price": 50
    }
  ],
  "pickupAddress": "Test Address",
  "deliveryAddress": "Test Address",
  "notes": "Handle with care"
}
```

### 5. Common Issues and Troubleshooting

#### Backend Issues
1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Port Already in Use**:
   - Change port in `.env` or kill existing process

3. **CORS Issues**:
   - Verify CORS is enabled in `server.js`

#### Flutter Issues
1. **Dependencies Not Found**:
   - Run `flutter pub get`
   - Restart IDE

2. **Emulator Issues**:
   - Restart emulator
   - Check Android Studio setup

3. **Network Connection Issues**:
   - For Android emulator, use `10.0.2.2` instead of `localhost`
   - Update `AppConfig.baseUrl` if needed

### 6. Performance Testing

1. **Load Testing Backend**:
   - Use tools like Artillery or Apache Bench
   - Test concurrent user registrations and orders

2. **Mobile App Performance**:
   - Use Flutter's performance profiling tools
   - Test on different device configurations

### 7. Security Testing

1. **API Security**:
   - Test JWT token validation
   - Verify protected routes require authentication
   - Test input validation

2. **Mobile Security**:
   - Test data encryption for local storage
   - Verify secure API communication (HTTPS in production)

## Integration Checklist

- [ ] Backend server starts successfully
- [ ] Database connection established
- [ ] Flutter app builds without errors
- [ ] User registration works end-to-end
- [ ] User login works end-to-end
- [ ] Services are fetched and displayed
- [ ] Orders can be created and tracked
- [ ] Payment integration works (test mode)
- [ ] Notifications are received and displayed
- [ ] Profile management works
- [ ] Order history is accessible
- [ ] Real-time updates work properly

## Production Deployment Considerations

1. **Backend**:
   - Use production MongoDB instance
   - Set up proper environment variables
   - Configure HTTPS
   - Set up proper logging

2. **Mobile App**:
   - Update API base URL to production
   - Configure release signing
   - Test on multiple devices
   - Set up crash reporting

## Support and Documentation

- Backend API documentation: See Postman collection
- Flutter app documentation: See `FLUTTER_SETUP_GUIDE.md`
- Project structure: See main `README.md`
