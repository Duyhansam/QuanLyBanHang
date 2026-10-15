package com.kanza.store.auth;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    // POST /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req, HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(req, http.getRemoteAddr()));
    }

    // GET /api/v1/auth/me  (cần header Authorization: Bearer <token>)
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(authService.getUser(Long.valueOf(jwt.getSubject())));
    }

    // PUT /api/v1/auth/me   body: { fullName, phone, address, city }  (cần đăng nhập)
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(authService.updateProfile(Long.valueOf(jwt.getSubject()), req));
    }

    // PUT /api/v1/auth/password   body: { currentPassword, newPassword }  (cần đăng nhập)
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@AuthenticationPrincipal Jwt jwt,
            @RequestBody ChangePasswordRequest req, HttpServletRequest http) {
        authService.changePassword(Long.valueOf(jwt.getSubject()), http.getRemoteAddr(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }

    // POST /api/v1/auth/forgot-password   body: { "email": "..." }
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        passwordResetService.requestReset(req.email());
        // Cùng một câu trả lời dù email có tồn tại hay không
        return ResponseEntity.ok(Map.of("message",
                "If this email is registered, you will receive instructions to reset your password."));
    }

    // POST /api/v1/auth/reset-password   body: { "token": "...", "password": "..." }
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest req) {
        passwordResetService.resetPassword(req.token(), req.password());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully!"));
    }
}
