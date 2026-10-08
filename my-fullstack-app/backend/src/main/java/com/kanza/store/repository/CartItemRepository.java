package com.kanza.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    @EntityGraph(attributePaths = { "product", "product.variants", "product.brand" })
    List<CartItem> findByUserIdOrderByIdAsc(Long userId);

    Optional<CartItem> findByUserIdAndCartItemId(Long userId, String cartItemId);

    void deleteByUserIdAndCartItemId(Long userId, String cartItemId);

    void deleteByUserId(Long userId);
}
