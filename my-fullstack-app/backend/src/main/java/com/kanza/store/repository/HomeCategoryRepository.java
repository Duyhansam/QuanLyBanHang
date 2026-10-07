package com.kanza.store.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kanza.store.entity.HomeCategory;

public interface HomeCategoryRepository extends JpaRepository<HomeCategory, Long> {

    List<HomeCategory> findAllByOrderBySortOrderAsc();
}
