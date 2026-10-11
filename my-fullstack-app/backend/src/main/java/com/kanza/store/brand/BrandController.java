package com.kanza.store.brand;

import java.util.List;

import com.kanza.store.product.Product;
import com.kanza.store.product.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin(origins = "*")
public class BrandController {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public BrandController(BrandRepository brandRepository, ProductRepository productRepository) {
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
    }

    // GET /api/brands
    @GetMapping
    public ResponseEntity<List<Brand>> getAllBrands() {
        List<Brand> brands = brandRepository.findAllByOrderByIdAsc();
        brands.forEach(this::fillProductCount);
        return ResponseEntity.ok(brands);
    }

    // GET /api/brands/nike
    @GetMapping("/{slug}")
    public ResponseEntity<Brand> getBrandBySlug(@PathVariable String slug) {
        return brandRepository.findBySlug(slug)
                .map(brand -> {
                    fillProductCount(brand);
                    return ResponseEntity.ok(brand);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/brands/nike/products
    @GetMapping("/{slug}/products")
    public ResponseEntity<List<Product>> getProductsByBrand(@PathVariable String slug) {
        if (brandRepository.findBySlug(slug).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productRepository.findByBrandSlugOrderByIdAsc(slug));
    }

    // Thay productCount lưu cứng trong DB bằng số sản phẩm thật (chỉ để trả về, không lưu lại DB)
    private void fillProductCount(Brand brand) {
        brand.setProductCount((int) productRepository.countByBrandIdAndVariantsIsNotEmpty(brand.getId()));
    }
}
