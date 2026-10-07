package com.kanza.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.Product;

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
}