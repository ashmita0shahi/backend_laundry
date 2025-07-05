@echo off
echo Starting LaundryEase Backend Server...
echo.
echo Make sure MongoDB is running!
echo.
cd /d "d:\sem 6\laundry_ease_backend"
echo Current directory: %cd%
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting server...
call npm start
