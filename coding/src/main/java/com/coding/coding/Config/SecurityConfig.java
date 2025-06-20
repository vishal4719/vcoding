package com.coding.coding.Config;

import com.coding.coding.Services.UserDetailServiceIMPL;
import com.coding.coding.Filter.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailServiceIMPL userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://192.168.56.1:3000",
            "http://192.168.0.0/24:3000"
        )); // Frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/create", "/api/auth/all",
                                "/admin/admin-login", "/admin/create-admin-user",
                                "/api/auth/user-login-enabled", "/api/auth/set-user-login-enabled",
                                "/api/questions/**", // allow GETs to /api/questions/*
                                "/test/*").permitAll()

                        // Allow GET /api/questions for everyone (for listing, viewing)
                        .requestMatchers(HttpMethod.GET, "/api/questions/**").permitAll()
                        // Allow GET /api/tests for everyone (for listing, viewing active/current tests)
                        .requestMatchers(HttpMethod.GET, "/api/tests/**").permitAll()

                        // Allow code run for authenticated users
                        .requestMatchers(HttpMethod.POST, "/api/code/run").authenticated()

                        // Restrict adding/updating/deleting questions to admins only
                        .requestMatchers(HttpMethod.POST, "/api/questions").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/questions/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasAuthority("ADMIN")

                        // Restrict adding/updating/deactivating tests to admins only
                        .requestMatchers(HttpMethod.POST, "/api/tests").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/tests/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/tests/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/tests/*/launch").hasAuthority("ADMIN")

                        .requestMatchers("/api/tests/admin").authenticated()
                        // Admin dashboard and related
                        .requestMatchers("/admin/**").hasAuthority("ADMIN")

                        // All other requests need to be authenticated
                        .anyRequest().authenticated()

                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}