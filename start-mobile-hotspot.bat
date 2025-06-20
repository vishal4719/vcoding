@echo off
echo ========================================
echo Starting Coding Platform - Mobile Hotspot
echo ========================================
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

echo [4/4] Starting Backend with Mobile Hotspot profile...
cd coding
start "Backend - Mobile Hotspot" cmd /k "mvn spring-boot:run -Dspring-boot.run.profiles=mobile-hotspot"

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo.
echo Backend will be available at: http://192.168.0.103:8080
echo Judge0 will be available at: http://192.168.0.103:2358
echo.
echo To check network info, visit: http://192.168.0.103:8080/api/network/info
echo.
echo Press any key to start the frontend...
pause > nul

echo Starting Frontend...
cd ..\frontend
start "Frontend - Mobile Hotspot" cmd /k "set HOST=0.0.0.0 && npm start"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Frontend: http://192.168.0.103:3000
echo Backend:  http://192.168.0.103:8080
echo Judge0:   http://192.168.0.103:2358
echo.
echo Users on your mobile hotspot can access the application
echo using the IP address: 192.168.0.103
echo.
pause 