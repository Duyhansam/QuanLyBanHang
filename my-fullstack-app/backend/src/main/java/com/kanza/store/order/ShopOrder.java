package com.kanza.store.order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Một đơn hàng. Đặt tên ShopOrder (không phải Order) để tránh trùng từ khóa ORDER của SQL.
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class ShopOrder {

    public static final String PENDING = "PENDING";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // Thông tin giao hàng
    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 20)
    private String paymentMethod; // COD, BANKING

    // PENDING -> CONFIRMED -> SHIPPING -> DELIVERED, hoặc CANCELLED
    @Column(nullable = false, length = 20)
    private String status = PENDING;

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double shippingFee;

    @Column(nullable = false)
    private Double total;

    private LocalDateTime createdAt;

    // cascade ALL: lưu / xóa đơn thì các dòng hàng (OrderItem) cũng được lưu / xóa theo.
    // orphanRemoval: dòng nào bị gỡ khỏi list sẽ bị xóa khỏi DB. @OrderBy giữ thứ tự theo id.
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }
}
