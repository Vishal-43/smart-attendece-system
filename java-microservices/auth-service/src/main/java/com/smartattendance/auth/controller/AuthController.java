package com.smartattendance.auth.controller;

import com.smartattendance.dto.auth.AuthLoginRequest;
import com.smartattendance.dto.auth.AuthTokens;
import com.smartattendance.dto.auth.TokenRefreshRequest;
import com.smartattendance.dto.auth.UserPublic;
import com.smartattendance.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthTokens> login(@RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokens> refreshToken(@RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserPublic> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return ResponseEntity.ok(authService.getCurrentUser(authHeader));
    }

    @PostMapping("/is-admin")
    public ResponseEntity<Boolean> isAdmin(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        boolean isAdmin = authService.isAdmin(authHeader);
        return ResponseEntity.ok(isAdmin);
    }

}
