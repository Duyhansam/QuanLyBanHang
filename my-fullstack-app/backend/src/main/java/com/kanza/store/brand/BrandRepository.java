package com.kanza.store.brand;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    List<Brand> findAllByOrderByIdAsc();

    Optional<Brand> findBySlug(String slug);
}
