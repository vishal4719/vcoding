@echo off
echo Starting Coding Platform for WLAN Access...
echo Your computer IP: 192.168.0.103
echo.
echo Services will be available at:
echo - Frontend: http://192.168.0.103:3000
echo - Backend: http://192.168.0.103:8080
echo - Judge0: http://192.168.0.103:2358
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
netstat -an | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    pause
    exit /b 1
)

REM Check if RabbitMQ is running
echo Checking RabbitMQ...
netstat -an | findstr :5672 >nul
if %errorlevel% neq 0 (
    echo RabbitMQ is not running. Please start RabbitMQ first.
    pause
    exit /b 1
)

REM Check if Judge0 is running
echo Checking Judge0...
netstat -an | findstr :2358 >nul
if %errorlevel% neq 0 (
    echo Judge0 is not running. Please start Judge0 first.
    pause
    exit /b 1
)

echo All required services are running!
echo.
echo Starting the application...

REM Start backend in a new window
echo Starting Backend...
start "Backend" cmd /k "cd coding && mvn spring-boot:run"

REM Wait a moment for backend to start
timeout /t 10 /nobreak >nul

REM Start frontend in a new window
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Application is starting...
echo.
echo Once all services are running, users on your network can access:
echo - Frontend: http://192.168.0.103:3000
echo - Backend API: http://192.168.0.103:8080
echo.
echo Press any key to exit this script (services will continue running)
pause 