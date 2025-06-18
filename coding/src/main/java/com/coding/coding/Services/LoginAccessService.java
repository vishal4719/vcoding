package com.coding.coding.Services;
import org.springframework.stereotype.Service;

@Service
public class LoginAccessService {
    private boolean userLoginEnabled = true; // default: enabled

    public boolean isUserLoginEnabled() {
        return userLoginEnabled;
    }

    public void setUserLoginEnabled(boolean enabled) {
        this.userLoginEnabled = enabled;
    }
}