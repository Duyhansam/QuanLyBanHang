package com.kanza.store.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.HeroSlide;

public interface HeroSlideRepository extends JpaRepository<HeroSlide, Long> {

    List<HeroSlide> findAllByOrderBySortOrderAsc();
}
