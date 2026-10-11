package com.kanza.store.product;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Cho phép React (Port 5173/3000) gọi API mà không bị chặn bởi CORS
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // 1. Lấy danh sách: GET /api/products, ?category=MEN, ?minId=6, ?type=BOOTS
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long minId,
            @RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(productService.getProductsByType(type));
        }
        return ResponseEntity.ok(productService.getProducts(category, minId));
    }

    // 2. Tìm kiếm: GET /api/products/search?q=tracker
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        return ResponseEntity.ok(productService.searchProducts(q));
    }

    // 3. Sản phẩm giảm giá: GET /api/products/sale
    @GetMapping("/sale")
    public ResponseEntity<List<Product>> getSaleProducts() {
        return ResponseEntity.ok(productService.getSaleProducts());
    }

    // 4. Chi tiết 1 sản phẩm: GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

   // 5. ADMIN - Thêm mới: POST /api/products
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody AdminProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    // 6. ADMIN - Sửa: PUT /api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody AdminProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
    // 7. ADMIN - Xóa: DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}