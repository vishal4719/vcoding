package com.coding.coding.Utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Component
public class NetworkConfigUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(NetworkConfigUtil.class);
    
    @Value("${judge0.api.url:http://localhost:2358}")
    private String judge0BaseUrl;
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    /**
     * Get current network information
     */
    public Map<String, String> getNetworkInfo() {
        Map<String, String> networkInfo = new HashMap<>();
        
        try {
            String localIp = getLocalNetworkIp();
            if (localIp != null) {
                networkInfo.put("localIp", localIp);
                networkInfo.put("backendUrl", "http://" + localIp + ":" + serverPort);
                networkInfo.put("judge0Url", getJudge0Url());
                networkInfo.put("frontendUrl", "http://" + localIp + ":3000");
            }
        } catch (Exception e) {
            logger.error("Error getting network info: {}", e.getMessage());
        }
        
        return networkInfo;
    }
    
    /**
     * Get the Judge0 URL for the current network
     */
    public String getJudge0Url() {
        // If Judge0 URL is already configured with a specific IP, use it
        if (!judge0BaseUrl.contains("localhost") && !judge0BaseUrl.contains("127.0.0.1")) {
            return judge0BaseUrl;
        }
        
        // Otherwise, try to detect the current network IP
        try {
            String localIp = getLocalNetworkIp();
            if (localIp != null) {
                return "http://" + localIp + ":2358";
            }
        } catch (Exception e) {
            logger.warn("Could not detect local IP, using default: {}", e.getMessage());
        }
        
        return judge0BaseUrl;
    }
    
    /**
     * Detect the local network IP address
     */
    public String getLocalNetworkIp() {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface networkInterface = networkInterfaces.nextElement();
                
                // Skip loopback and down interfaces
                if (networkInterface.isLoopback() || !networkInterface.isUp()) {
                    continue;
                }
                
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    
                    // Look for IPv4 addresses that are not loopback
                    if (!address.isLoopbackAddress() && address.getHostAddress().indexOf(':') == -1) {
                        String ip = address.getHostAddress();
                        
                        // Prefer private network addresses
                        if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
                            logger.info("Detected local network IP: {}", ip);
                            return ip;
                        }
                    }
                }
            }
        } catch (SocketException e) {
            logger.error("Error detecting network interfaces: {}", e.getMessage());
        }
        
        return null;
    }
    
    /**
     * Check if Judge0 is accessible
     */
    public boolean isJudge0Accessible() {
        try {
            String judge0Url = getJudge0Url();
            String host = judge0Url.replace("http://", "").replace(":2358", "");
            
            InetAddress address = InetAddress.getByName(host);
            return address.isReachable(3000); // 3 second timeout
        } catch (Exception e) {
            logger.warn("Judge0 is not accessible: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get network environment type
     */
    public String getNetworkEnvironment() {
        String localIp = getLocalNetworkIp();
        if (localIp == null) {
            return "unknown";
        }
        
        if (localIp.startsWith("192.168.0.")) {
            return "mobile_hotspot";
        } else if (localIp.startsWith("10.")) {
            return "college_wlan";
        } else if (localIp.startsWith("172.10.")) {
            return "college_wlan";
        } else if (localIp.startsWith("172.")) {
            return "docker_network";
        } else {
            return "other";
        }
    }
} 