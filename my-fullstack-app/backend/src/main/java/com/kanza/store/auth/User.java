package com.kanza.store.auth;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email; // luôn lưu chữ thường

    // Chỉ lưu mật khẩu đã băm BCrypt, KHÔNG BAO GIỜ lưu mật khẩu gốc
    @Column(nullable = false)
    @ToString.Exclude
    private String passwordHash;

    @Column(nullable = false)
    private String role = "USER"; // USER, ADMIN

    // Hồ sơ giao hàng (không bắt buộc), dùng để điền sẵn khi thanh toán
    @Column(length = 20)
    private String phone;

    private String address;

    @Column(length = 100)
    private String city;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}