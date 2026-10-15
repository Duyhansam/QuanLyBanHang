package com.kanza.store.review;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Mỗi người chỉ có 1 đánh giá cho mỗi sản phẩm (đánh giá lại = sửa đánh giá cũ).
// Tên người đánh giá được chụp lại lúc viết để hiển thị nhanh, không cần join bảng users.
@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(columnNames = { "product_id", "user_id" }))
@Getter
@Setter
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String userName;

    @Column(nullable = false)
    private Integer rating; // 1 - 5

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
