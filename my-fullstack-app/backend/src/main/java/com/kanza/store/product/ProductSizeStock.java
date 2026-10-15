package com.kanza.store.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Số lượng còn trong kho của MỘT size thuộc MỘT sản phẩm (dùng chung cho mọi màu).
// Không đặt khóa ngoại tới products: khi xóa sản phẩm, ProductService dọn các dòng này.
@Entity
@Table(name = "product_size_stocks", uniqueConstraints = @UniqueConstraint(columnNames = { "product_id", "shoe_size" }))
@Getter
@Setter
@NoArgsConstructor
public class ProductSizeStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "shoe_size", nullable = false, length = 20)
    private String shoeSize;

    @Column(nullable = false)
    private Integer quantity = 0;
}
