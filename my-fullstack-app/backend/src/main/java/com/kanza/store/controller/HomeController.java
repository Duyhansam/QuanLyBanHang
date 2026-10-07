package com.kanza.store.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kanza.store.entity.HeroSlide;
import com.kanza.store.entity.HomeCategory;
import com.kanza.store.entity.PromoBanner;
import com.kanza.store.repository.HeroSlideRepository;
import com.kanza.store.repository.HomeCategoryRepository;
import com.kanza.store.repository.PromoBannerRepository;

@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "*")
public class HomeController {

    private final HeroSlideRepository heroSlideRepository;
    private final HomeCategoryRepository homeCategoryRepository;
    private final PromoBannerRepository promoBannerRepository;

    public HomeController(HeroSlideRepository heroSlideRepository,
            HomeCategoryRepository homeCategoryRepository,
            PromoBannerRepository promoBannerRepository) {
        this.heroSlideRepository = heroSlideRepository;
        this.homeCategoryRepository = homeCategoryRepository;
        this.promoBannerRepository = promoBannerRepository;
    }

    // GET /api/home/hero-slides
    @GetMapping("/hero-slides")
    public ResponseEntity<List<HeroSlide>> getHeroSlides() {
        return ResponseEntity.ok(heroSlideRepository.findAllByOrderBySortOrderAsc());
    }

    // GET /api/home/categories
    @GetMapping("/categories")
    public ResponseEntity<List<HomeCategory>> getCategories() {
        return ResponseEntity.ok(homeCategoryRepository.findAllByOrderBySortOrderAsc());
    }

    // GET /api/home/banner  (404 nếu không có banner nào đang bật)
    @GetMapping("/banner")
    public ResponseEntity<PromoBanner> getBanner() {
        return promoBannerRepository.findFirstByActiveTrueOrderByIdAsc()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
