# LaundryEase Developer Quick Reference

## 🚀 Quick Start Commands

### Backend
```bash
# Start server
npm start

# Install dependencies
npm install

# Test API
curl http://localhost:5000/api/auth/test
```

### Flutter App
```bash
# Get dependencies
flutter pub get

# Run app
flutter run

# Build APK
flutter build apk

# Run tests
flutter test
```

## 📁 Project Structure

```
laundry_ease_backend/
├── src/                          # Backend source code
│   ├── server.js                 # Main server file
│   ├── config/                   # Configuration files
│   ├── controllers/              # Business logic
│   ├── middleware/               # Express middleware
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   └── utils/                    # Utility functions
├── laundry_ease_mobile/          # Flutter app
│   ├── lib/
│   │   ├── main.dart             # App entry point
│   │   ├── config/               # App configuration
│   │   ├── models/               # Data models
│   │   ├── services/             # API services
│   │   ├── providers/            # State management
│   │   ├── screens/              # UI screens
│   │   ├── widgets/              # Reusable widgets
│   │   └── utils/                # Utility functions
│   ├── assets/                   # App assets
│   └── test/                     # Test files
└── docs/                         # Documentation
```

## 🔧 Key Configuration Files

### Backend
- `src/server.js` - Main server configuration
- `src/config/config.js` - App configuration
- `src/config/db.js` - Database connection
- `.env` - Environment variables

### Flutter
- `lib/main.dart` - App entry point
- `lib/config/app_config.dart` - API endpoints
- `lib/config/theme.dart` - App theming
- `pubspec.yaml` - Dependencies

## 📱 Flutter App Architecture

### State Management
- **Provider** pattern for global state
- Separate providers for Auth, Orders, Services, Payments, Notifications

### Key Providers
- `AuthProvider` - User authentication and profile
- `OrderProvider` - Order management and tracking
- `ServiceProvider` - Service data and management
- `PaymentProvider` - Payment processing
- `NotificationProvider` - In-app notifications

### Screen Structure
```
screens/
├── auth/                 # Login, Register
├── home/                 # Dashboard, Navigation
├── orders/               # Order management
├── services/             # Service browsing
├── payment/              # Payment processing
├── notifications/        # Notification center
├── profile/              # User profile
└── settings/             # App settings
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `GET /api/services/:id/items` - Get service items

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/history` - Get order history
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/unread-count` - Unread count

## 🎨 UI Theme & Colors

### Primary Colors
- Primary Blue: `#2196F3`
- Dark Blue: `#1976D2`
- Light Blue: `#E3F2FD`
- Accent: `#FF4081`

### Typography
- **Font Family**: Google Fonts Poppins
- **Headings**: Poppins Bold/SemiBold
- **Body**: Poppins Regular/Medium

## 🔐 Authentication Flow

1. User opens app → Splash Screen
2. Check stored token → Auto-login if valid
3. No token → Login Screen
4. Login/Register → Store JWT token
5. Authenticated → Navigate to Dashboard

## 📦 Order Management Flow

1. **Browse Services** → Select service type
2. **Choose Items** → Add items with quantities
3. **Order Details** → Set pickup/delivery addresses
4. **Payment** → Khalti integration
5. **Tracking** → Real-time status updates
6. **History** → View past orders

## 💳 Payment Integration (Khalti)

### Test Credentials
- **Public Key**: `test_public_key_dc74e0fd57cb46cd93832aee0a507256`
- **Secret Key**: Set in backend `.env`

### Test Cards
- **Card Number**: `5555555555554444`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## 🔔 Notification System

### Types
- **Order Updates** - Status changes
- **Payment Confirmations** - Successful payments
- **Delivery Notifications** - Out for delivery, delivered
- **System Alerts** - Important updates

### Implementation
- Local notifications for immediate alerts
- In-app notification center
- Badge counts for unread notifications

## 🧪 Testing

### Backend Testing
```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Flutter Testing
```bash
# Widget tests
flutter test

# Integration tests
flutter drive --target=test_driver/app.dart
```

## 📱 Platform-Specific Notes

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 34 (Android 14)
- Uses network security config for HTTP in development

### iOS
- Minimum iOS: 11.0
- Uses App Transport Security exceptions for HTTP in development

## 🐛 Common Issues & Solutions

### Backend Issues
1. **MongoDB Connection**: Ensure MongoDB is running on port 27017
2. **Port Conflicts**: Change PORT in `.env` if 5000 is occupied
3. **CORS Errors**: Verify CORS middleware is enabled

### Flutter Issues
1. **Dependencies**: Run `flutter pub get` after any pubspec.yaml changes
2. **Build Errors**: Run `flutter clean` then `flutter pub get`
3. **Emulator Issues**: Restart emulator or try different device

### Network Issues
1. **Android Emulator**: Use `10.0.2.2` instead of `localhost`
2. **iOS Simulator**: `localhost` should work
3. **Physical Device**: Use computer's IP address

## 🚀 Deployment Checklist

### Backend Production
- [ ] Set production MongoDB URI
- [ ] Configure environment variables
- [ ] Set up HTTPS with SSL certificates
- [ ] Configure production logging
- [ ] Set up monitoring and alerts

### Mobile App Production
- [ ] Update API base URL to production
- [ ] Configure release signing keys
- [ ] Test on multiple devices
- [ ] Set up crash reporting (Firebase Crashlytics)
- [ ] Configure app store metadata

## 📚 Additional Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [Provider State Management](https://pub.dev/packages/provider)
- [Khalti Payment Integration](https://docs.khalti.com/)
- [Node.js Express Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🆘 Getting Help

1. Check the `INTEGRATION_TESTING_GUIDE.md` for detailed testing
2. Review error logs in terminal/console
3. Use Flutter/Node.js debugging tools
4. Check GitHub issues for similar problems
