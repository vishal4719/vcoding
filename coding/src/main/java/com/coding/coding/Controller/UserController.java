package com.coding.coding.Controller;

import com.coding.coding.Entity.LoginRequest;
import com.coding.coding.Entity.User;
import com.coding.coding.Repository.AllowedDomainRepository;
import com.coding.coding.Services.UserService;
import com.coding.coding.Services.LoginAccessService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import com.coding.coding.Utils.JwtUtilis;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private AllowedDomainRepository allowedDomainRepository;


    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtilis jwtUtil;

    @Autowired
    private LoginAccessService loginAccessService;

    @PostMapping("/create")
    public ResponseEntity<String> createUser(@RequestBody User user) {
        try {
            User existingUser = userService.findByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest().body("User with this email already exists");
            }
            // Restrict signup to allowed domains unless admin
            String email = user.getEmail();
            String domain = email.substring(email.indexOf('@') + 1);
            boolean isAdmin = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.equalsIgnoreCase("ADMIN"));
            if (!isAdmin && !allowedDomainRepository.existsByDomain(domain)) {
                return ResponseEntity.status(403).body("Signup only allowed for specific domains.");
            }
            userService.saveNewUser(user);
            return ResponseEntity.ok("User created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating user: " + e.getMessage());
        }
    }
//
//    @GetMapping("/all")
//    public ResponseEntity<List<User>> getAllUsers() {
//        List<User> users = userService.getAllUsers();
//        return ResponseEntity.ok(users);
//    }

//    @GetMapping("/{id}")
//    public ResponseEntity<User> getUserById(@PathVariable String id) {
//        try {
//            ObjectId objectId = new ObjectId(id);
//            User user = userService.getUserById(objectId);
//            if (user != null) {
//                return ResponseEntity.ok(user);
//            }
//            return ResponseEntity.notFound().build();
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

//    @PutMapping("/update")
//    public ResponseEntity<String> updateUser(@RequestBody User user) {
//        try {
//            userService.updateUser(user);
//            return ResponseEntity.ok("User updated successfully");
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
//        }
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        try {
            ObjectId objectId = new ObjectId(id);
            userService.deleteUser(objectId);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting user: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logoutCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            userService.logoutUser(email);
            return ResponseEntity.ok("User logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error logging out user: " + e.getMessage());
        }
    }

    @GetMapping("/login-status/{email}")
    public ResponseEntity<Map<String, Object>> getLoginStatus(@PathVariable String email) {
        boolean isLoggedIn = userService.isUserLoggedIn(email);
        boolean canLogin = userService.canUserLogin(email);

        return ResponseEntity.ok(Map.of(
                "email", email,
                "isLoggedIn", isLoggedIn,
                "canLogin", canLogin
        ));
    }

    @PostMapping("/force-logout/{email}")
    public ResponseEntity<String> forceLogoutUser(@PathVariable String email) {
        try {
            userService.forceLogoutUser(email);
            return ResponseEntity.ok("User forcefully logged out");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error forcing logout: " + e.getMessage());
        }
    }

    @GetMapping("/user-login-enabled")
    public ResponseEntity<?> isUserLoginEnabled() {
        return ResponseEntity.ok(Map.of("enabled", loginAccessService.isUserLoginEnabled()));
    }

    @PostMapping("/set-user-login-enabled")
    public ResponseEntity<?> setUserLoginEnabled(@RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) return ResponseEntity.badRequest().body("Missing 'enabled' field");
        loginAccessService.setUserLoginEnabled(enabled);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Extract domain from email
        String domain = email.substring(email.indexOf('@') + 1);

        try {
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }

            boolean isAdmin = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> r.equalsIgnoreCase("ADMIN"));
            if (!isAdmin && !allowedDomainRepository.existsByDomain(domain)) {
                return ResponseEntity.status(403).body(Map.of("message", "Login only allowed for specific domains."));
            }

            // Enforce login access for normal users
            if (user.getRoles() != null &&
                    user.getRoles().stream().map(String::toLowerCase).anyMatch(r -> r.equals("user")) &&
                    !loginAccessService.isUserLoginEnabled()) {
                return ResponseEntity.status(403).body(Map.of("message", "User login is currently disabled by admin"));
            }

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            String token = jwtUtil.generateToken(email);
            userService.loginUser(email); // Mark user as logged in
            userService.updateLastLogin(email); // Update last login timestamp

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "id", user.getId().toString(),
                    "role", user.getRoles() != null ? user.getRoles() : List.of(),
                    "username", user.getEmail() != null ? user.getEmail() : "",
                    "name", user.getName() != null ? user.getName() : "",
                    "message", "Login successful"
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }


}