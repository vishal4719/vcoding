@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Network Detection Tool
echo ========================================
echo.

echo Detecting your current network configuration...
echo.

REM Get the IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    echo Found IP: !ip!
    
    REM Check if it's mobile hotspot (192.168.0.x)
    echo !ip! | findstr /r "^192\.168\.0\." >nul
    if !errorlevel! equ 0 (
        echo.
        echo ========================================
        echo MOBILE HOTSPOT DETECTED
        echo ========================================
        echo Your IP: !ip!
        echo Network: Mobile Hotspot (192.168.0.x)
        echo.
        echo Recommended startup: start-mobile-hotspot.bat
        echo.
        echo Users can access your app at:
        echo Frontend: http://!ip!:3000
        echo Backend:  http://!ip!:8080
        echo Judge0:   http://!ip!:2358
        echo.
        goto :end
    )
    
    REM Check if it's college WLAN (10.x.x.x)
    echo !ip! | findstr /r "^10\." >nul
    if !errorlevel! equ 0 (
        echo.
        echo ========================================
        echo COLLEGE WLAN DETECTED
        echo ========================================
        echo Your IP: !ip!
        echo Network: College WLAN (10.x.x.x)
        echo.
        echo Recommended startup: start-college-wlan.bat
        echo.
        echo Users can access your app at:
        echo Frontend: http://!ip!:3000
        echo Backend:  http://!ip!:8080
        echo Judge0:   http://!ip!:2358
        echo.
        goto :end
    )
    
    REM Check if it's college WLAN (172.10.x.x)
    echo !ip! | findstr /r "^172\.10\." >nul
    if !errorlevel! equ 0 (
        echo.
        echo ========================================
        echo COLLEGE WLAN DETECTED
        echo ========================================
        echo Your IP: !ip!
        echo Network: College WLAN (172.10.x.x)
        echo Default Gateway: 172.10.8.1
        echo.
        echo Recommended startup: start-college-wlan.bat
        echo.
        echo Users can access your app at:
        echo Frontend: http://!ip!:3000
        echo Backend:  http://!ip!:8080
        echo Judge0:   http://!ip!:2358
        echo.
        goto :end
    )
    
    REM Check if it's other private network (172.x.x.x)
    echo !ip! | findstr /r "^172\." >nul
    if !errorlevel! equ 0 (
        echo.
        echo ========================================
        echo OTHER PRIVATE NETWORK DETECTED
        echo ========================================
        echo Your IP: !ip!
        echo Network: Other Private Network (172.x.x.x)
        echo.
        echo Recommended startup: start-college-wlan.bat
        echo (This will auto-detect your IP)
        echo.
        echo Users can access your app at:
        echo Frontend: http://!ip!:3000
        echo Backend:  http://!ip!:8080
        echo Judge0:   http://!ip!:2358
        echo.
        goto :end
    )
)

echo.
echo ========================================
echo UNKNOWN NETWORK
echo ========================================
echo Could not determine network type.
echo.
echo Please check your network connection and try again.
echo.

:end
echo ========================================
echo Network Detection Complete
echo ========================================
echo.
echo To start the application, run the recommended startup script.
echo.
echo To manually check network info after starting:
echo curl http://localhost:8080/api/network/info
echo.
pause 