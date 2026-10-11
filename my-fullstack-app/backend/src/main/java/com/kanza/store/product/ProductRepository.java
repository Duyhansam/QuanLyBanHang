package com.kanza.store.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Override
    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findAll();

    @Override
    @EntityGraph(attributePaths = {"variants", "brand"})
    Optional<Product> findById(Long id);

    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByNameContainingIgnoreCase(String keyword);

    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByCategory(String category);

    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByOriginalPriceNotNull();

// Lấy sản phẩm theo loại giày (BOOTS, RUNNING...), không phân biệt hoa thường
    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByTypeIgnoreCaseOrderByIdAsc(String type);

    // Lấy sản phẩm có id >= minId
    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByIdGreaterThanEqualOrderByIdAsc(Long id);

    // Lấy sản phẩm theo category và có id >= minId
    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByCategoryAndIdGreaterThanEqualOrderByIdAsc(String category, Long id);

    // Lấy sản phẩm theo slug của brand (nike, adidas...)
    @EntityGraph(attributePaths = {"variants", "brand"})
    List<Product> findByBrandSlugOrderByIdAsc(String slug);

    // Đếm số sản phẩm (có ít nhất 1 biến thể) của 1 brand
    long countByBrandIdAndVariantsIsNotEmpty(Long brandId);
}