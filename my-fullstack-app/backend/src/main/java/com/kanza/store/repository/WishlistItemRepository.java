package com.kanza.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.WishlistItem;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    // Nạp sẵn product + variants + brand để trả JSON (open-in-view đang tắt)
    @EntityGraph(attributePaths = { "product", "product.variants", "product.brand" })
    List<WishlistItem> findByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
