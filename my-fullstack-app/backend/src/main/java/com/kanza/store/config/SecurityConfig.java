package com.kanza.store.config;

import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Các đường dẫn bắt buộc đăng nhập. Mọi thứ còn lại giữ nguyên như cũ (công khai).
    private static final String[] PROTECTED = { "/api/v1/auth/me", "/api/v1/auth/password", "/api/cart/**", "/api/wishlist/**",
            "/api/orders/**", "/api/reviews/mine" }; 
  // Thêm / sửa / xóa sản phẩm: chỉ tài khoản có role ADMIN. Các GET vẫn công khai.
    private static final String[] PRODUCT_PATHS = { "/api/products", "/api/products/**" };
    // Xem đánh giá là công khai; viết / xóa đánh giá phải đăng nhập
    private static final String[] REVIEW_PATHS = { "/api/reviews", "/api/reviews/**" };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, BearerTokenResolver resolver) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable()) // API dùng JWT trong header, không dùng cookie
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Thứ tự rất quan trọng: Spring Security áp dụng quy tắc KHỚP ĐẦU TIÊN, nên quy tắc cụ thể phải đứng trước
                        // và anyRequest().permitAll() (mọi thứ còn lại công khai) phải đứng cuối cùng.
                        .requestMatchers(PROTECTED).authenticated()
                        .requestMatchers(HttpMethod.POST, REVIEW_PATHS).authenticated()
                        .requestMatchers(HttpMethod.DELETE, REVIEW_PATHS).authenticated()
                        .requestMatchers(HttpMethod.POST, PRODUCT_PATHS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, PRODUCT_PATHS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, PRODUCT_PATHS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, PRODUCT_PATHS).hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().permitAll())
                // Bật xác thực JWT: filter đọc token từ header "Authorization: Bearer <token>" (qua resolver bên dưới),
                // kiểm tra chữ ký + hạn dùng rồi nạp quyền (role) vào request.
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenResolver(resolver)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    // Chỉ đọc token ở các đường dẫn cần đăng nhập. Nhờ vậy token hết hạn/sai
    // không làm hỏng các API công khai như /api/products.
   @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        return request -> {
            String path = request.getRequestURI();
            String method = request.getMethod();
            boolean isRead = "GET".equalsIgnoreCase(method)
                    || "HEAD".equalsIgnoreCase(method)
                    || "OPTIONS".equalsIgnoreCase(method);
            // Danh sách này phải KHỚP với các quy tắc authorizeHttpRequests ở trên: thêm API cần đăng nhập mới thì sửa cả hai chỗ.
            boolean needsAuth = path.equals("/api/v1/auth/me")
                    || path.equals("/api/v1/auth/password")
                    || path.equals("/api/reviews/mine")
                    || (path.startsWith("/api/reviews") && !isRead)
                    || path.startsWith("/api/cart")
                    || path.startsWith("/api/wishlist")
                    || (path.startsWith("/api/products") && !isRead)
                    || path.startsWith("/api/admin")
                    || path.startsWith("/api/orders");
            return needsAuth ? delegate.resolve(request) : null;
        };
    }
  // Đọc claim "role" trong JWT (USER / ADMIN) và đổi thành quyền ROLE_USER / ROLE_ADMIN
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("role");
        authorities.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    // BCrypt: băm mật khẩu MỘT CHIỀU kèm "salt" ngẫu nhiên; không giải ngược ra mật khẩu gốc được, chỉ so khớp bằng matches().
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Khóa bí mật dùng để KÝ và KIỂM TRA JWT (HS256 cần ít nhất 32 byte). Lấy từ app.jwt.secret trong application.properties,
    // tuyệt đối không đưa lên git công khai.
    @Bean
    public SecretKey jwtSecretKey(@Value("${app.jwt.secret}") String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters long");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    // Encoder dùng ở JwtService để TẠO token; decoder bên dưới dùng cùng khóa để KIỂM TRA token.
    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }

    // CORS: cho phép trình duyệt ở các địa chỉ frontend bên dưới được gọi API. setExposedHeaders cho phép JavaScript
    // đọc header Retry-After (mặc định trình duyệt ẩn các header lạ).
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        cfg.setExposedHeaders(List.of("Retry-After"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}