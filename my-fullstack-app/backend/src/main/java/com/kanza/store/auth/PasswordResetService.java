package com.kanza.store.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.exception.ApiException;
import com.kanza.store.mail.EmailSender;

@Service
public class PasswordResetService {

    private static final Duration TOKEN_LIFETIME = Duration.ofMinutes(30);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
        this.frontendUrl = frontendUrl;
    }

    // Luôn "im lặng" kể cả khi email không tồn tại, để không lộ email nào đã đăng ký
    @Transactional
    public void requestReset(String rawEmail) {
        String email = rawEmail == null ? "" : rawEmail.trim().toLowerCase();

        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.deleteByUserId(user.getId()); // mỗi người chỉ có 1 token còn hiệu lực

            String token = newToken();
            PasswordResetToken entity = new PasswordResetToken();
            entity.setUserId(user.getId());
            // Chỉ lưu BĂM (SHA-256) của token trong DB, không lưu token gốc: nếu DB bị lộ thì kẻ xấu cũng không dùng được link.
            // Token gốc chỉ nằm trong email gửi cho người dùng.
            entity.setTokenHash(sha256(token));
            entity.setExpiresAt(LocalDateTime.now().plus(TOKEN_LIFETIME));
            tokenRepository.save(entity);

            String link = frontendUrl + "/reset-password?token=" + token;
            emailSender.send(user.getEmail(), "Reset your Kanza password",
                    "Hello " + user.getFullName() + ",\n\n"
                            + "You (or someone else) requested a password reset. Click the link below within 30 minutes:\n"
                            + link + "\n\n"
                            + "If this wasn't you, please ignore this email.");
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String password = newPassword == null ? "" : newPassword;
        if (password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be between 8 and 72 characters!");
        }

        PasswordResetToken saved = tokenRepository.findByTokenHash(sha256(token == null ? "" : token))
                // Token phải còn hạn (30 phút). Sai token hay hết hạn đều trả cùng một lỗi để không lộ thông tin.
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "The password reset link is invalid or has expired!"));

        User user = userRepository.findById(saved.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                        "The password reset link is invalid or has expired!"));

        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId()); // token chỉ dùng được 1 lần
    }

    // 32 byte ngẫu nhiên an toàn (SecureRandom) mã hóa base64url -> chuỗi ~43 ký tự, không đoán được và dùng thẳng trong URL được.
    private String newToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
