package com.kanza.store.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 50 đánh giá mới nhất của một sản phẩm
    List<Review> findTop50ByProductIdOrderByIdDesc(Long productId);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductId(Long productId);

    @Query("select avg(r.rating) from Review r where r.productId = :productId")
    Double averageRating(@Param("productId") Long productId);

    // Dùng khi admin xóa sản phẩm
    void deleteByProductId(Long productId);
}
