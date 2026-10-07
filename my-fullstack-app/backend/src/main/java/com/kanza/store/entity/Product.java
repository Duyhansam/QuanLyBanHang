package com.kanza.store.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID tự động tăng trong Database
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    private Double originalPrice;     // giá gốc (chỉ sản phẩm sale mới có)
    private Integer discountPercent;  // 20, 30, 50...

    private String badge; // Ví dụ: "NEW STYLE", "SALE"

    @Column(columnDefinition = "TEXT") // Cho phép lưu mô tả dài
    private String description;

    private String category; // MEN, WOMEN, KID, UNISEX
    private String color;    // màu chính (dùng cho sản phẩm sale)

    private Double rating;   // dùng cho bestSeller
    private String reviews;  // ví dụ "(2.4k)"

    // Mỗi sản phẩm thuộc 1 thương hiệu (có thể để trống)
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    // Quan hệ 1 Sản phẩm - Nhiều biến thể (1-N)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();
}