package com.kanza.store.home;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HeroSlideRepository extends JpaRepository<HeroSlide, Long> {

    List<HeroSlide> findAllByOrderBySortOrderAsc();
}
