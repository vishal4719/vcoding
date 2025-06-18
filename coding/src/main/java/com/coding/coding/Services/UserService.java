package com.coding.coding.Services;

import com.coding.coding.Entity.User;
import com.coding.coding.Repository.UserRespository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRespository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void saveNewUser(User user) {
        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER"));
        user.setCreatedAt(LocalDateTime.now()); // Set creation timestamp
        userRepository.save(user);
    }
    public void saveAdmin(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("ADMIN"));
        user.setCreatedAt(LocalDateTime.now()); // Set creation timestamp for admin
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(ObjectId id) {
        return userRepository.findById(id).orElse(null);
    }

    public void deleteUser(ObjectId id) {
        userRepository.deleteById(id);
    }
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean isUserLoggedIn(String email) {
        User user = findByEmail(email);
        return user != null && user.isLoggedIn();
    }


    public boolean canUserLogin(String email) {
        User user = findByEmail(email);
        return user != null; // Add your business logic here
    }

    public void logoutUser(String email) {
        User user = findByEmail(email);
        if (user != null) {
            user.setLoggedIn(false);
            userRepository.save(user);
        }
    }

    public void forceLogoutUser(String email) {
        logoutUser(email); // Same as regular logout for now
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public void loginUser(String email) {
        User user = findByEmail(email);
        if (user != null) {
            user.setLoggedIn(true);
            userRepository.save(user);
        }
    }
    public void updateLastLogin(String email) {
        User user = findByEmail(email);
        if (user != null) {
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }
}