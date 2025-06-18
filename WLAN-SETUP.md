# WLAN Setup for Coding Platform

This guide will help you set up your coding platform to be accessible over WLAN so all users on the same network can access your software.

## Prerequisites

Before starting, ensure you have the following installed and running:

1. **MongoDB** - Database server (port 27017)
2. **RabbitMQ** - Message queue server (port 5672)
3. **Docker Desktop** - For running Judge0
4. **Java 17** - For Spring Boot backend
5. **Node.js** - For React frontend

## Your Network Configuration

- **Your Computer IP**: `192.168.0.103`
- **Network Range**: `192.168.0.0/24`

## Quick Start

### Option 1: Automated Startup (Recommended)

1. **Start Judge0**:
   ```bash
   start-judge0.bat
   ```

2. **Start All Services**:
   ```bash
   start-wlan.bat
   ```

### Option 2: Manual Startup

#### 1. Start Judge0
```bash
# Using Docker
docker run -d --name judge0 -p 2358:2358 -p 5000:5000 judge0/judge0:latest
```

#### 2. Start Backend
```bash
cd coding
mvn spring-boot:run
```

#### 3. Start Frontend
```bash
cd frontend
set HOST=0.0.0.0
npm start
```

## Access URLs

Once all services are running, users on your network can access:

- **Frontend**: http://192.168.0.103:3000
- **Backend API**: http://192.168.0.103:8080
- **Judge0**: http://192.168.0.103:2358

## Configuration Changes Made

### Backend (Spring Boot)
- **File**: `coding/src/main/resources/application.properties`
  - Added `server.address=0.0.0.0` to bind to all network interfaces
  - Updated Judge0 URL to use local IP

- **File**: `coding/src/main/java/com/coding/coding/Config/WebConfig.java`
  - Updated CORS to allow network access

- **File**: `coding/src/main/java/com/coding/coding/Config/SecurityConfig.java`
  - Updated CORS configuration for network access

### Frontend (React)
- **File**: `frontend/package.json`
  - Updated start script to bind to all interfaces

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Check what's using the port
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :2358

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Firewall Issues
If users can't connect, check Windows Firewall:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Add your Java and Node.js applications
4. Ensure they're allowed on both Private and Public networks

### Network Connectivity
Test connectivity from another device:

```bash
# Test if your computer is reachable
ping 192.168.0.103

# Test specific ports
telnet 192.168.0.103 3000
telnet 192.168.0.103 8080
telnet 192.168.0.103 2358
```

## Security Considerations

⚠️ **Important**: This setup makes your application accessible to anyone on your local network. Consider:

1. **Network Security**: Ensure your WLAN is password-protected
2. **Application Security**: Use strong passwords for admin accounts
3. **Firewall**: Configure Windows Firewall appropriately
4. **Production**: For production use, consider using a reverse proxy (nginx) and HTTPS

## Stopping Services

To stop all services:

```bash
# Stop Judge0
docker stop judge0

# Stop backend (Ctrl+C in the backend window)
# Stop frontend (Ctrl+C in the frontend window)
```

## Support

If you encounter issues:

1. Check that all prerequisite services are running
2. Verify your IP address hasn't changed
3. Check Windows Firewall settings
4. Ensure all ports are available and not blocked

Your application should now be accessible to all users on your WLAN network! 