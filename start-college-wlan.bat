@echo off
echo ========================================
echo Starting Coding Platform - College WLAN
echo ========================================
echo.
echo College WLAN Configuration:
echo - Network Range: 172.10.x.x
echo - Default Gateway: 172.10.8.1
echo - Auto IP Detection: Enabled
echo.

echo [1/4] Starting Judge0...
start "Judge0" cmd /k "docker run -d --name judge0 -p 2358:2358 -p 5000:5000 judge0/judge0:latest"
timeout /t 5 /nobreak > nul

echo [2/4] Starting MongoDB...
echo MongoDB should be running on localhost:27017
echo If not, please start MongoDB manually

echo [3/4] Starting RabbitMQ...
echo RabbitMQ should be running on localhost:5672
echo If not, please start RabbitMQ manually

echo [4/4] Starting Backend with College WLAN profile...
cd coding
start "Backend - College WLAN" cmd /k "mvn spring-boot:run -Dspring-boot.run.profiles=college-wlan"

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo.
echo Backend will be available at: http://localhost:8080
echo Judge0 will be available at: http://localhost:2358
echo.
echo To check network info, visit: http://localhost:8080/api/network/info
echo.
echo Press any key to start the frontend...
pause > nul

echo Starting Frontend...
cd ..\frontend
start "Frontend - College WLAN" cmd /k "set HOST=0.0.0.0 && npm start"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo Judge0:   http://localhost:2358
echo.
echo The application will automatically detect your college WLAN IP
echo and make it accessible to other users on the same network.
echo.
echo College WLAN users can access using your detected IP address.
echo.
pause 