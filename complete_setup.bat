@echo off
echo ========================================
echo   LaundryEase Complete System Setup
echo ========================================
echo.

echo This script will set up and test the complete LaundryEase system
echo including both the backend API and Flutter mobile app.
echo.
echo Prerequisites:
echo - Node.js installed
echo - MongoDB running
echo - Flutter SDK installed
echo - Android emulator or device connected
echo.

set /p continue="Continue with setup? (y/n): "
if /i not "%continue%"=="y" exit /b 0

echo.
echo ========================================
echo    STEP 1: Backend Setup
echo ========================================
echo.

echo Current directory: %cd%
echo Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server in background...
start "LaundryEase Backend" cmd /k "npm start"
echo Waiting for server to start...
timeout /t 10 /nobreak

echo.
echo Testing backend API...
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Backend server may not be responding
    echo Please check if MongoDB is running and server started successfully
    pause
)

echo.
echo ========================================
echo    STEP 2: Flutter App Setup
echo ========================================
echo.

echo Navigating to Flutter app directory...
cd laundry_ease_mobile
if %errorlevel% neq 0 (
    echo ERROR: laundry_ease_mobile directory not found
    pause
    exit /b 1
)

echo.
echo Checking Flutter installation...
flutter --version
if %errorlevel% neq 0 (
    echo ERROR: Flutter is not installed or not in PATH
    echo Please install Flutter from https://flutter.dev/docs/get-started/install
    pause
    exit /b 1
)

echo.
echo Installing Flutter dependencies...
flutter pub get
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Flutter dependencies
    pause
    exit /b 1
)

echo.
echo Running Flutter doctor...
flutter doctor

echo.
echo Analyzing Flutter code...
flutter analyze

echo.
echo Running Flutter tests...
flutter test
if %errorlevel% neq 0 (
    echo WARNING: Some tests failed, but continuing...
)

echo.
echo ========================================
echo    STEP 3: Launch Mobile App
echo ========================================
echo.

echo Checking for connected devices...
flutter devices

echo.
echo Choose how to run the app:
echo 1. Run on connected device/emulator
echo 2. Build APK for testing
echo 3. Skip app launch
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo Launching Flutter app...
    echo Note: Make sure an emulator is running or device is connected
    flutter run
) else if "%choice%"=="2" (
    echo.
    echo Building APK...
    flutter build apk --debug
    echo APK built successfully!
    echo Location: build\app\outputs\flutter-apk\app-debug.apk
) else (
    echo Skipping app launch...
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.

echo The LaundryEase system is now set up:
echo.
echo Backend API:
echo - Running on: http://localhost:5000
echo - API endpoints available at: http://localhost:5000/api
echo.
echo Mobile App:
echo - Flutter project ready in: laundry_ease_mobile/
echo - Run with: flutter run
echo.
echo Next Steps:
echo 1. Test user registration and login
echo 2. Browse services and create orders
echo 3. Test payment integration (Khalti test mode)
echo 4. Verify notifications and order tracking
echo.
echo Documentation:
echo - Backend: README.md
echo - Flutter: FLUTTER_SETUP_GUIDE.md
echo - Integration Testing: INTEGRATION_TESTING_GUIDE.md
echo.

echo For troubleshooting, check the guides in the project root.
echo.

pause
