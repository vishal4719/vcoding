# Network Setup Guide for Coding Platform

This guide helps you run your coding platform on different networks (mobile hotspot, college WLAN, etc.) without manual configuration changes.

## Quick Start

### 1. Detect Your Network
First, run the network detection tool to see what type of network you're on:

```bash
detect-network.bat
```

This will tell you:
- Your current IP address
- Network type (mobile hotspot, college WLAN, etc.)
- Recommended startup script

### 2. Start the Application

Based on your network type, use the appropriate startup script:

#### For Mobile Hotspot (192.168.0.x network):
```bash
start-mobile-hotspot.bat
```

#### For College WLAN (10.x.x.x network):
```bash
start-college-wlan.bat
```

#### For Other Networks (auto-detect):
```bash
start-college-wlan.bat
```

## How It Works

### Automatic IP Detection
The application now automatically detects your network IP address and configures Judge0 accordingly:

1. **NetworkConfigUtil**: Detects your local network IP
2. **Environment Profiles**: Different configurations for different networks
3. **Dynamic Judge0 URL**: Automatically uses the correct IP for Judge0

### Network Types Supported

| Network Type | IP Range | Configuration | Startup Script |
|--------------|----------|---------------|----------------|
| Mobile Hotspot | 192.168.0.x | Fixed IP (192.168.0.103) | `start-mobile-hotspot.bat` |
| College WLAN | 10.x.x.x | Auto-detect IP | `start-college-wlan.bat` |
| Other Private | 172.x.x.x | Auto-detect IP | `start-college-wlan.bat` |

## Configuration Files

### Main Configuration
- `application.properties`: Default configuration with auto-detection
- `application-mobile-hotspot.properties`: Mobile hotspot specific config
- `application-college-wlan.properties`: College WLAN specific config

### Key Features
- **Auto IP Detection**: Automatically finds your network IP
- **Environment Profiles**: Different configs for different networks
- **Network Info API**: Check network status via `/api/network/info`
- **Judge0 Connectivity**: Automatically tests Judge0 connectivity

## API Endpoints

### Network Information
```bash
GET /api/network/info
```

Returns:
```json
{
  "localIp": "192.168.0.103",
  "backendUrl": "http://192.168.0.103:8080",
  "judge0Url": "http://192.168.0.103:2358",
  "frontendUrl": "http://192.168.0.103:3000",
  "environment": "mobile_hotspot",
  "judge0Accessible": "true"
}
```

## Troubleshooting

### 1. Check Network Info
After starting the application, visit:
```
http://localhost:8080/api/network/info
```

This will show you:
- Detected IP address
- Judge0 connectivity status
- Network environment type

### 2. Judge0 Not Accessible
If Judge0 is not accessible:

1. **Check if Judge0 is running**:
   ```bash
   docker ps | grep judge0
   ```

2. **Restart Judge0**:
   ```bash
   docker stop judge0
   docker rm judge0
   docker run -d --name judge0 -p 2358:2358 -p 5000:5000 judge0/judge0:latest
   ```

3. **Check firewall settings**:
   - Ensure port 2358 is not blocked
   - Check Windows Firewall settings

### 3. Wrong IP Detected
If the wrong IP is detected:

1. **Check network interfaces**:
   ```bash
   ipconfig
   ```

2. **Manual override**: Set the IP in the appropriate profile file:
   ```properties
   judge0.api.url=http://YOUR_IP:2358
   ```

### 4. Users Can't Connect
If users on the same network can't connect:

1. **Check if services are bound to 0.0.0.0**:
   - Backend: `server.address=0.0.0.0`
   - Frontend: `HOST=0.0.0.0`

2. **Test connectivity**:
   ```bash
   ping YOUR_IP
   telnet YOUR_IP 3000
   telnet YOUR_IP 8080
   telnet YOUR_IP 2358
   ```

3. **Check Windows Firewall**:
   - Allow Java and Node.js through firewall
   - Allow ports 3000, 8080, 2358

## Manual Configuration

### For Custom Networks
If you need to use a specific IP address:

1. **Create a custom profile**:
   ```bash
   copy application-college-wlan.properties application-custom.properties
   ```

2. **Edit the custom profile**:
   ```properties
   judge0.api.url=http://YOUR_CUSTOM_IP:2358
   ```

3. **Start with custom profile**:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=custom
   ```

### Environment Variables
You can also override settings with environment variables:

```bash
set JUDGE0_API_URL=http://192.168.1.100:2358
mvn spring-boot:run
```

## Security Considerations

⚠️ **Important**: When running on shared networks (like college WLAN):

1. **Network Security**: Ensure the network is secure
2. **Application Security**: Use strong admin passwords
3. **Firewall**: Configure appropriate firewall rules
4. **Access Control**: Consider implementing network-based access control

## Migration from Old Setup

If you were using the old hardcoded setup:

1. **Backup your old configuration** (if needed)
2. **Run network detection**: `detect-network.bat`
3. **Use the appropriate startup script**
4. **Test the application**: Visit `/api/network/info`

The new setup is backward compatible and will work with your existing data.

## Support

If you encounter issues:

1. Run `detect-network.bat` to check your network
2. Check `/api/network/info` for system status
3. Review the troubleshooting section above
4. Check the application logs for detailed error messages

Your application should now work seamlessly across different networks! 🚀 