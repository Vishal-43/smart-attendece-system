package com.smartattendance.data.service;

import com.smartattendance.dto.users.UserCreate;
import com.smartattendance.dto.users.UserOut;
import com.smartattendance.dto.users.UserUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final WebClient webClient;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    public List<UserOut> listUsers() {
        try {
            return webClient.get()
                    .uri("/api/v1/users/")
                    .retrieve()
                    .bodyToFlux(UserOut.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("Failed to list users: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch users", e);
        }
    }

    public UserOut getUser(Integer userId) {
        try {
            return webClient.get()
                    .uri("/api/v1/users/{user_id}", userId)
                    .retrieve()
                    .bodyToMono(UserOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to get user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to fetch user", e);
        }
    }

    public UserOut createUser(UserCreate request) {
        try {
            return webClient.post()
                    .uri("/api/v1/users/")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(UserOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to create user: {}", e.getMessage());
            throw new RuntimeException("Failed to create user", e);
        }
    }

    public UserOut updateUser(Integer userId, UserUpdate request) {
        try {
            return webClient.put()
                    .uri("/api/v1/users/{user_id}", userId)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(UserOut.class)
                    .block();
        } catch (Exception e) {
            log.error("Failed to update user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to update user", e);
        }
    }

    public void deleteUser(Integer userId) {
        try {
            webClient.delete()
                    .uri("/api/v1/users/{user_id}", userId)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Failed to delete user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to delete user", e);
        }
    }

}
