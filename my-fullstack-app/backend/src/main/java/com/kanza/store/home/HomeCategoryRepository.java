package com.kanza.store.home;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeCategoryRepository extends JpaRepository<HomeCategory, Long> {

    List<HomeCategory> findAllByOrderBySortOrderAsc();
}
