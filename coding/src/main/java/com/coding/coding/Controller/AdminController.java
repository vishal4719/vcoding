package com.coding.coding.Controller;

import com.coding.coding.Entity.AllowedDomain;
import com.coding.coding.Entity.User;
import com.coding.coding.Entity.LoginRequest;

import com.coding.coding.Repository.AllowedDomainRepository;
import com.coding.coding.Services.UserService;
import com.coding.coding.Utils.JwtUtilis;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserService userService;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private com.coding.coding.Utils.JwtUtilis jwtUtilis;
    @Autowired
    private AllowedDomainRepository allowedDomainRepository;

    // Add allowed domain
    @PostMapping("/add-domain")
    public ResponseEntity<?> addDomain(@RequestParam String domain) {
        if (allowedDomainRepository.existsByDomain(domain)) {
            return ResponseEntity.badRequest().body("Domain already exists");
        }
        AllowedDomain allowedDomain = new AllowedDomain();
        allowedDomain.setDomain(domain);
        allowedDomainRepository.save(allowedDomain);
        return ResponseEntity.ok("Domain added successfully");
    }

    // Remove allowed domain
    @DeleteMapping("/remove-domain")
    public ResponseEntity<?> removeDomain(@RequestParam String domain) {
        Optional<AllowedDomain> toDelete = allowedDomainRepository.findAll()
                .stream()
                .filter(d -> d.getDomain().equalsIgnoreCase(domain))
                .findFirst();

        if (toDelete.isPresent()) {
            allowedDomainRepository.delete(toDelete.get());
            return ResponseEntity.ok("Domain removed");
        } else {
            return ResponseEntity.status(404).body("Domain not found");
        }
    }

    // View allowed domains (optional)
    @GetMapping("/allowed-domains")
    public List<AllowedDomain> getAllowedDomains() {
        return allowedDomainRepository.findAll();
    }

    @PostMapping("/create-admin-user")
    public void CreateUser(@RequestBody User user) {
        userService.saveAdmin(user);
    }

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtUtilis.generateToken(loginRequest.getEmail());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "token", token,
                    "username", loginRequest.getEmail()
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Print stack trace for debugging
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }
    @GetMapping("users/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

//
//    @GetMapping("/user/{id}")
//    public ResponseEntity<?> getUser(@PathVariable ObjectId id) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User user = userService.findByEmail(authentication.getName());
//        if (user != null && user.getRoles().contains("ADMIN")) {
//            Optional<User> user1 = userService.getUserById(id);
//            return new ResponseEntity<>(user1, HttpStatus.OK);
//        }
//        return new ResponseEntity<>("error",HttpStatus.FORBIDDEN);
//    }

    @DeleteMapping("/users/deleteUser/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable ObjectId id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByEmail(authentication.getName());

        if (user != null && user.getRoles().contains("ADMIN")) {
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>("Access Denied", HttpStatus.FORBIDDEN);
    }




}
