package com.kanza.store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "promo_banners")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromoBanner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String label;       // "Limited Time Only"

    @Column(nullable = false)
    private String title;       // "Summer Sale"

    @Column(columnDefinition = "TEXT")
    private String description; // "Up to 40% off on selected items"

    private String buttonText;  // "Shop the Sale"
    private String image;       // "/images/banners/bannerfooter.png"

    private Boolean active = true; // chỉ banner đang bật (active) mới được hiển thị
}
