package com.kanza.store.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.PromoBanner;

public interface PromoBannerRepository extends JpaRepository<PromoBanner, Long> {

    Optional<PromoBanner> findFirstByActiveTrueOrderByIdAsc();
}
