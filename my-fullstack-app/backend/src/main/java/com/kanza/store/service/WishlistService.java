package com.kanza.store.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.dto.WishlistItemDto;
import com.kanza.store.dto.WishlistRequest;
import com.kanza.store.entity.Product;
import com.kanza.store.entity.WishlistItem;
import com.kanza.store.exception.ApiException;
import com.kanza.store.repository.ProductRepository;
import com.kanza.store.repository.WishlistItemRepository;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistItemRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemDto> getWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(WishlistItemDto::from).toList();
    }

    // Thêm vào wishlist (nếu đã có thì chỉ cập nhật biến thể). Sản phẩm không tồn tại => 404
    @Transactional
    public List<WishlistItemDto> add(Long userId, WishlistRequest req) {
        if (req == null || req.productId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu mã sản phẩm!");
        }
        Product product = productRepository.findById(req.productId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại!"));
        upsert(userId, product, req.variantId());
        return getWishlist(userId);
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    // Gộp wishlist của khách (lưu trong localStorage) vào tài khoản sau khi đăng nhập.
    // Sản phẩm không còn tồn tại thì bỏ qua, không làm hỏng cả lần gộp.
    @Transactional
    public List<WishlistItemDto> merge(Long userId, List<WishlistRequest> items) {
        if (items != null) {
            for (WishlistRequest req : items) {
                if (req == null || req.productId() == null) {
                    continue;
                }
                productRepository.findById(req.productId())
                        .ifPresent(product -> upsert(userId, product, req.variantId()));
            }
        }
        return getWishlist(userId);
    }

    private void upsert(Long userId, Product product, Long variantId) {
        Long validVariant = variantId != null
                && product.getVariants().stream().anyMatch(v -> variantId.equals(v.getId())) ? variantId : null;

        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, product.getId())
                .orElseGet(() -> {
                    WishlistItem w = new WishlistItem();
                    w.setUserId(userId);
                    w.setProduct(product);
                    return w;
                });
        if (validVariant != null) {
            item.setVariantId(validVariant);
        }
        wishlistRepository.save(item);
    }
}
