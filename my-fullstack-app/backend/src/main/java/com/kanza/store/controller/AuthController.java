package com.kanza.store.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kanza.store.dto.AuthResponse;
import com.kanza.store.dto.LoginRequest;
import com.kanza.store.dto.RegisterRequest;
import com.kanza.store.dto.UserDto;
import com.kanza.store.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    // GET /api/v1/auth/me  (cần header Authorization: Bearer <token>)
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(authService.getUser(Long.valueOf(jwt.getSubject())));
    }
}