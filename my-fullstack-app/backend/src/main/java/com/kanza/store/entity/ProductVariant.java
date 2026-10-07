package com.kanza.store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String colorName; // Tên màu sắc (ví dụ: "Dark Brown Camo", "Black")

    @Column(columnDefinition = "TEXT")
    private String image; // Đường dẫn ảnh hoặc URL ảnh lớn

    @Column(columnDefinition = "TEXT")
    private String thumbnail; // Đường dẫn ảnh thu nhỏ

    // Quan hệ Nhiều biến thể - Thuộc 1 Sản phẩm (N-1)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnore // Tránh lỗi lặp vô tận khi trả JSON về React
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;
}