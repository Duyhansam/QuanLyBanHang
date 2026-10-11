package com.kanza.store.home;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoBannerRepository extends JpaRepository<PromoBanner, Long> {

    Optional<PromoBanner> findFirstByActiveTrueOrderByIdAsc();
}
