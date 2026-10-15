package com.kanza.store.order;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Một dòng sản phẩm trong đơn. Tên, ảnh, giá được CHỤP LẠI tại thời điểm đặt hàng,
// nên sau này admin đổi giá hoặc xóa sản phẩm thì đơn cũ vẫn giữ nguyên.
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private ShopOrder order;

    // Không đặt khóa ngoại tới products để xóa sản phẩm không làm hỏng đơn cũ
    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String image;

    private String colorName;

    @Column(nullable = false, length = 20)
    private String selectedSize;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Integer quantity;
}
