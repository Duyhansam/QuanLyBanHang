package com.kanza.store.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    List<Brand> findAllByOrderByIdAsc();

    Optional<Brand> findBySlug(String slug);
}
