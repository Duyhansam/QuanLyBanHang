package com.kanza.store.service;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kanza.store.dto.AuthResponse;
import com.kanza.store.dto.LoginRequest;
import com.kanza.store.dto.RegisterRequest;
import com.kanza.store.dto.UserDto;
import com.kanza.store.entity.User;
import com.kanza.store.exception.ApiException;
import com.kanza.store.repository.UserRepository;

@Service
public class AuthService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        String fullName = req.fullName() == null ? "" : req.fullName().trim();
        String email = normalizeEmail(req.email());
        String password = req.password() == null ? "" : req.password();

        if (fullName.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng nhập họ và tên!");
        }
        if (!EMAIL.matcher(email).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email không hợp lệ!");
        }
        // BCrypt chỉ dùng 72 byte đầu nên giới hạn độ dài ở đây
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu phải từ 8 đến 72 ký tự!");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email này đã được đăng ký!");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    public AuthResponse login(LoginRequest req) {
        String email = normalizeEmail(req.email());
        String password = req.password() == null ? "" : req.password();

        // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào đã tồn tại
        User user = userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng!"));

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    public UserDto getUser(Long id) {
        return userRepository.findById(id)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Tài khoản không tồn tại!"));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}