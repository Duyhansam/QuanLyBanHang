package com.kanza.store.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long expirationMinutes;

    public JwtService(JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration-minutes:1440}") long expirationMinutes) {
        this.jwtEncoder = jwtEncoder;
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getId())) // sub = id user
                .claim("email", user.getEmail())
                // role (USER / ADMIN) được SecurityConfig đọc lại để phân quyền cho từng API.
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES))
                .build();
        // HS256 = ký token bằng khóa bí mật (app.jwt.secret). Khi nhận request, backend dùng chính khóa này để kiểm tra chữ ký
        // nên không cần lưu token trong DB. Token hết hạn sau expirationMinutes phút.
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}