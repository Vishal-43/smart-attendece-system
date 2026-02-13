package com.smartattendance.auth.service;

import com.smartattendance.dto.auth.AuthLoginRequest;
import com.smartattendance.dto.auth.AuthTokens;
import com.smartattendance.dto.auth.TokenRefreshRequest;
import com.smartattendance.dto.auth.UserPublic;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public AuthTokens login(AuthLoginRequest request) {
        try {
            return webClient.post()
                    .uri("/api/v1/auth/login")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AuthTokens.class)
                    .block();
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            throw new RuntimeException("Authentication failed", e);
        }
    }

    public AuthTokens refreshToken(TokenRefreshRequest request) {
        try {
            return webClient.post()
                    .uri("/api/v1/auth/refresh")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(AuthTokens.class)
                    .block();
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed", e);
        }
    }

    public UserPublic getCurrentUser(String authHeader) {
        try {
            WebClient.RequestHeadersSpec<?> request = webClient.get()
                    .uri("/api/v1/auth/me");
            
            if (authHeader != null && !authHeader.isEmpty()) {
                request = request.header("Authorization", authHeader);
            }
            
            return request.retrieve()
                    .bodyToMono(UserPublic.class)
                    .block();
        } catch (Exception e) {
            log.error("Get current user failed: {}", e.getMessage());
            throw new RuntimeException("Failed to get current user", e);
        }
    }

    public boolean isAdmin(String authHeader) {
        try {
            WebClient.RequestHeadersSpec<?> request = webClient.post()
                    .uri("/api/v1/auth/is-admin");
            
            if (authHeader != null && !authHeader.isEmpty()) {
                request = request.header("Authorization", authHeader);
            }
            
            Boolean result = request.retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            
            return result != null && result;
        } catch (Exception e) {
            log.error("Check admin status failed: {}", e.getMessage());
            return false;
        }
    }

}
