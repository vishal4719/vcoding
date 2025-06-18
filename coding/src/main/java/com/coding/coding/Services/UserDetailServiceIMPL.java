package com.coding.coding.Services;

import com.coding.coding.Entity.User;
import com.coding.coding.Repository.UserRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class UserDetailServiceIMPL implements UserDetailsService {

    @Autowired
    private UserRespository userRespository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRespository.findByEmail(username);
        if (user != null) {
            return org.springframework.security.core.userdetails.User.builder()
                    .username(user.getEmail())
                    .password(user.getPassword()) // This should be the encoded password from DB
                    .authorities(user.getRoles().stream()
                                .map(role -> new SimpleGrantedAuthority(role))
                                .collect(java.util.stream.Collectors.toList()))
                    .build();
        }
        throw new UsernameNotFoundException("User not found with username: " + username);
    }
}