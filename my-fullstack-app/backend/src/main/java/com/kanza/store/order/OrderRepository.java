package com.kanza.store.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<ShopOrder, Long> {

    // Đơn của một người dùng, mới nhất lên đầu
    @EntityGraph(attributePaths = "items")
    List<ShopOrder> findByUserIdOrderByIdDesc(Long userId);

    // Chỉ lấy được đơn của chính người đó (không xem được đơn người khác)
    @EntityGraph(attributePaths = "items")
    Optional<ShopOrder> findByIdAndUserId(Long id, Long userId);

    // ---- Dành cho admin ----
    @EntityGraph(attributePaths = "items")
    List<ShopOrder> findAllByOrderByIdDesc();

    @EntityGraph(attributePaths = "items")
    List<ShopOrder> findByStatusOrderByIdDesc(String status);

    @EntityGraph(attributePaths = "items")
    Optional<ShopOrder> findWithItemsById(Long id);

    // Số đơn ĐÃ GIAO của user có chứa sản phẩm này (dùng để cho phép viết đánh giá)
    @Query("select count(o) from ShopOrder o join o.items i "
            + "where o.userId = :userId and o.status = 'DELIVERED' and i.productId = :productId")
    long countDeliveredWithProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
