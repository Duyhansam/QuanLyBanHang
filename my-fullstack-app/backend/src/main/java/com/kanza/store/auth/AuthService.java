package com.kanza.store.auth;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kanza.store.exception.ApiException;

@Service
public class AuthService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE = Pattern.compile("^[0-9+\\-\\s().]{8,20}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginAttemptService loginAttempts;

    // Hash giả để email không tồn tại cũng tốn thời gian BCrypt như email có thật
    // (tránh việc đo thời gian phản hồi để dò xem email nào đã đăng ký)
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            LoginAttemptService loginAttempts) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.loginAttempts = loginAttempts;
        this.dummyHash = passwordEncoder.encode("dummy-password-for-timing");
    }

    public AuthResponse register(RegisterRequest req) {
        String fullName = req.fullName() == null ? "" : req.fullName().trim();
        String email = normalizeEmail(req.email());
        String password = req.password() == null ? "" : req.password();

        if (fullName.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter your full name!");
        }
        if (!EMAIL.matcher(email).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address!");
        }
        // BCrypt chỉ dùng 72 byte đầu nên giới hạn độ dài ở đây
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be between 8 and 72 characters!");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "This email is already registered!");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user = userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    public AuthResponse login(LoginRequest req, String ip) {
        String email = normalizeEmail(req.email());
        String password = req.password() == null ? "" : req.password();

        // 1. Đang bị khóa thì từ chối luôn, không kiểm tra mật khẩu nữa
        long wait = loginAttempts.secondsUntilUnlocked(email, ip);
        if (wait > 0) {
            throw tooManyAttempts(wait);
        }

        // 2. Kiểm tra mật khẩu (luôn chạy BCrypt dù email có tồn tại hay không)
        User user = userRepository.findByEmail(email).orElse(null);
        boolean passwordOk = passwordEncoder.matches(password, user != null ? user.getPasswordHash() : dummyHash);

        if (user == null || !passwordOk) {
            loginAttempts.recordFailure(email, ip);
            // Lần sai này vừa chạm ngưỡng -> báo khóa ngay
            wait = loginAttempts.secondsUntilUnlocked(email, ip);
            if (wait > 0) {
                throw tooManyAttempts(wait);
            }
        // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào đã tồn tại
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect email or password!");
        }

        // 3. Đăng nhập đúng -> xóa bộ đếm sai của cặp email + IP này
        loginAttempts.recordSuccess(email, ip);
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    private ApiException tooManyAttempts(long seconds) {
        long minutes = (seconds + 59) / 60;
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                "Too many failed attempts. Please try again in " + minutes + " minute(s)!", seconds);
    }

    public UserDto getUser(Long id) {
        return userRepository.findById(id)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account does not exist!"));
    }

    // Cập nhật hồ sơ (họ tên, số điện thoại, địa chỉ). Email không đổi được.
    public UserDto updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account does not exist!"));

        String fullName = req == null || req.fullName() == null ? "" : req.fullName().trim();
        if (fullName.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter your full name!");
        }
        if (fullName.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is too long (max 100 characters)!");
        }
        String phone = blankToNull(req.phone());
        if (phone != null && !PHONE.matcher(phone).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid phone number!");
        }
        String address = blankToNull(req.address());
        if (address != null && address.length() > 255) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Address is too long (max 255 characters)!");
        }
        String city = blankToNull(req.city());
        if (city != null && city.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "City is too long (max 100 characters)!");
        }

        user.setFullName(fullName);
        user.setPhone(phone);
        user.setAddress(address);
        user.setCity(city);
        return UserDto.from(userRepository.save(user));
    }

    // Đổi mật khẩu: phải nhập đúng mật khẩu hiện tại.
    // Nhập sai dùng chung bộ đếm với đăng nhập, nên kẻ cầm trộm token cũng không dò được mật khẩu cũ.
    public void changePassword(Long userId, String ip, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account does not exist!"));
        String current = req == null || req.currentPassword() == null ? "" : req.currentPassword();
        String next = req == null || req.newPassword() == null ? "" : req.newPassword();

        long wait = loginAttempts.secondsUntilUnlocked(user.getEmail(), ip);
        if (wait > 0) {
            throw tooManyAttempts(wait);
        }
        if (!passwordEncoder.matches(current, user.getPasswordHash())) {
            loginAttempts.recordFailure(user.getEmail(), ip);
            wait = loginAttempts.secondsUntilUnlocked(user.getEmail(), ip);
            if (wait > 0) {
                throw tooManyAttempts(wait);
            }
            // Dùng 400 (không dùng 401) để React không tưởng là phiên đăng nhập đã hết hạn
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect!");
        }
        loginAttempts.recordSuccess(user.getEmail(), ip);

        if (next.length() < 8 || next.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be between 8 and 72 characters!");
        }
        if (next.equals(current)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be different from the current password!");
        }
        user.setPasswordHash(passwordEncoder.encode(next));
        userRepository.save(user);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}