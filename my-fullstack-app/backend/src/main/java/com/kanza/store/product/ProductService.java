package com.kanza.store.product;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.brand.BrandRepository;
import com.kanza.store.cart.CartItemRepository;
import com.kanza.store.exception.ApiException;
import com.kanza.store.product.AdminProductRequest.VariantRequest;
import com.kanza.store.wishlist.WishlistItemRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CartItemRepository cartItemRepository;
    private final WishlistItemRepository wishlistItemRepository;

    public ProductService(ProductRepository productRepository,
            BrandRepository brandRepository,
            CartItemRepository cartItemRepository,
            WishlistItemRepository wishlistItemRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.cartItemRepository = cartItemRepository;
        this.wishlistItemRepository = wishlistItemRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // ===== ADMIN: thêm / sửa / xóa =====

    @Transactional
    public Product createProduct(AdminProductRequest req) {
        Product product = new Product();
        applyRequest(product, req);
        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, AdminProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm!"));
        applyRequest(product, req);
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm!");
        }
        // Giỏ hàng / wishlist đang trỏ tới sản phẩm này phải xóa trước, nếu không DB báo lỗi khóa ngoại
        cartItemRepository.deleteByProductId(id);
        wishlistItemRepository.deleteByProductId(id);
        productRepository.deleteById(id); // các biến thể màu bị xóa theo (cascade)
    }

    private void applyRequest(Product product, AdminProductRequest req) {
        if (req.name() == null || req.name().isBlank()) {
            throw bad("Vui lòng nhập tên sản phẩm!");
        }
        if (req.price() == null || req.price() <= 0) {
            throw bad("Giá bán phải lớn hơn 0!");
        }
        if (req.originalPrice() != null && req.originalPrice() <= req.price()) {
            throw bad("Giá gốc phải lớn hơn giá bán (hoặc để trống nếu không giảm giá)!");
        }

        // Chỉ giữ các màu có ảnh
        List<VariantRequest> variants = req.variants() == null ? List.<VariantRequest>of()
                : req.variants().stream()
                        .filter(v -> v != null && v.image() != null && !v.image().isBlank())
                        .toList();
        if (variants.isEmpty()) {
            throw bad("Cần ít nhất 1 màu có ảnh!");
        }

        product.setName(req.name().trim());
        product.setPrice(req.price());
        product.setOriginalPrice(req.originalPrice());
        // % giảm tính tự động để không bao giờ lệch với giá
        product.setDiscountPercent(req.originalPrice() == null ? null
                : (int) Math.round((1 - req.price() / req.originalPrice()) * 100));
        product.setBadge(blankToNull(req.badge()));
        product.setDescription(blankToNull(req.description()));
        product.setCategory(upperOrNull(req.category()));
        product.setType(upperOrNull(req.type()));
        product.setColor(blankToNull(req.color()));
        product.setBrand(req.brandId() == null ? null
                : brandRepository.findById(req.brandId())
                        .orElseThrow(() -> bad("Thương hiệu không tồn tại!")));

        syncVariants(product, variants);
    }

    // Màu có id -> sửa tại chỗ (giữ id). Màu không có id -> thêm mới. Màu không còn trong danh sách -> bị xóa.
    private void syncVariants(Product product, List<VariantRequest> requested) {
        Map<Long, ProductVariant> existing = new HashMap<>();
        for (ProductVariant v : product.getVariants()) {
            if (v.getId() != null) {
                existing.put(v.getId(), v);
            }
        }

        List<ProductVariant> result = new ArrayList<>();
        for (VariantRequest vr : requested) {
            ProductVariant variant = vr.id() == null ? null : existing.get(vr.id());
            if (variant == null) {
                variant = new ProductVariant();
                variant.setProduct(product); // bắt buộc, nếu không product_id sẽ bị null
            }
            String image = vr.image().trim();
            String thumbnail = blankToNull(vr.thumbnail());
            variant.setColorName(blankToNull(vr.colorName()));
            variant.setImage(image);
            variant.setThumbnail(thumbnail == null ? image : thumbnail);
            result.add(variant);
        }

        product.getVariants().clear();
        product.getVariants().addAll(result);
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String upperOrNull(String s) {
        return s == null || s.isBlank() ? null : s.trim().toUpperCase();
    }

    // ===== Phần cũ giữ nguyên =====

    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword.trim());
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category.trim().toUpperCase());
    }

    public List<Product> getProducts(String category, Long minId) {
        boolean hasCategory = category != null && !category.isBlank();
        if (minId != null) {
            return hasCategory
                    ? productRepository.findByCategoryAndIdGreaterThanEqualOrderByIdAsc(category.trim().toUpperCase(), minId)
                    : productRepository.findByIdGreaterThanEqualOrderByIdAsc(minId);
        }
        return hasCategory ? getProductsByCategory(category) : getAllProducts();
    }

      public List<Product> getProductsByType(String type) {
        return productRepository.findByTypeIgnoreCaseOrderByIdAsc(type.trim());
    }
    public List<Product> getSaleProducts() {
        return productRepository.findByOriginalPriceNotNull();
    }
}