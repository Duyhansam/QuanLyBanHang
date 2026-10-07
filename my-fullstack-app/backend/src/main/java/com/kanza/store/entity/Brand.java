package com.kanza.store.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String logo; // lưu đường dẫn, ví dụ "/logo/nike.png"

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer productCount;

    @Column(unique = true)
    private String slug;
}