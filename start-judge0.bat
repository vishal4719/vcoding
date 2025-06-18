@echo off
echo Starting Judge0 for WLAN Access...
echo Judge0 will be available at: http://192.168.0.103:2358
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Pull the latest Judge0 image
echo Pulling Judge0 image...
docker pull judge0/judge0:latest

REM Stop any existing Judge0 container
echo Stopping existing Judge0 container...
docker stop judge0 >nul 2>&1
docker rm judge0 >nul 2>&1

REM Start Judge0 with network binding
echo Starting Judge0...
docker run -d --name judge0 -p 2358:2358 -p 5000:5000 judge0/judge0:latest

echo.
echo Judge0 is starting...
echo You can access Judge0 at: http://192.168.0.103:2358
echo.
echo Press any key to exit this script (Judge0 will continue running)
pause 