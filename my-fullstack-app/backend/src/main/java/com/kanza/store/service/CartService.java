package com.kanza.store.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.dto.CartItemDto;
import com.kanza.store.dto.CartItemRequest;
import com.kanza.store.entity.CartItem;
import com.kanza.store.entity.Product;
import com.kanza.store.exception.ApiException;
import com.kanza.store.repository.CartItemRepository;
import com.kanza.store.repository.ProductRepository;

@Service
public class CartService {

    private static final int MAX_QUANTITY = 99;

    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CartItemDto> getCart(Long userId) {
        return cartRepository.findByUserIdOrderByIdAsc(userId).stream().map(CartItemDto::from).toList();
    }

    // Thêm vào giỏ: cùng cartItemId thì cộng dồn số lượng
    @Transactional
    public List<CartItemDto> add(Long userId, CartItemRequest req) {
        Product product = findProduct(req)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại!"));
        upsert(userId, product, req);
        return getCart(userId);
    }

    @Transactional
    public void setQuantity(Long userId, String cartItemId, Integer quantity) {
        CartItem item = cartRepository.findByUserIdAndCartItemId(userId, cartItemId == null ? "" : cartItemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sản phẩm không có trong giỏ hàng!"));
        item.setQuantity(clamp(quantity == null ? 1 : quantity));
        cartRepository.save(item);
    }

    @Transactional
    public void remove(Long userId, String cartItemId) {
        cartRepository.deleteByUserIdAndCartItemId(userId, cartItemId);
    }

    @Transactional
    public void clear(Long userId) {
        cartRepository.deleteByUserId(userId);
    }

    // Gộp giỏ hàng của khách (localStorage) vào tài khoản: số lượng được cộng dồn.
    // Sản phẩm không còn tồn tại thì bỏ qua.
    @Transactional
    public List<CartItemDto> merge(Long userId, List<CartItemRequest> items) {
        if (items != null) {
            for (CartItemRequest req : items) {
                findProduct(req).ifPresent(product -> upsert(userId, product, req));
            }
        }
        return getCart(userId);
    }

    private java.util.Optional<Product> findProduct(CartItemRequest req) {
        if (req == null || req.productId() == null) {
            return java.util.Optional.empty();
        }
        return productRepository.findById(req.productId());
    }

    private void upsert(Long userId, Product product, CartItemRequest req) {
        Long variantId = req.variantId() != null
                && product.getVariants().stream().anyMatch(v -> req.variantId().equals(v.getId()))
                        ? req.variantId()
                        : null;

        String size = req.selectedSize() == null || req.selectedSize().isBlank() ? "M" : req.selectedSize().trim();
        if (size.length() > 20) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Size không hợp lệ!");
        }

        String key = req.cartItemId() == null || req.cartItemId().isBlank()
                ? product.getId() + "-" + size + "-" + (variantId == null ? "default" : variantId)
                : req.cartItemId().trim();
        if (key.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mã giỏ hàng không hợp lệ!");
        }

        int quantity = clamp(req.quantity() == null ? 1 : req.quantity());

        CartItem item = cartRepository.findByUserIdAndCartItemId(userId, key).orElseGet(() -> {
            CartItem c = new CartItem();
            c.setUserId(userId);
            c.setCartItemId(key);
            c.setProduct(product);
            c.setVariantId(variantId);
            c.setSelectedSize(size);
            c.setQuantity(0);
            return c;
        });
        item.setQuantity(Math.min(MAX_QUANTITY, item.getQuantity() + quantity));
        cartRepository.save(item);
    }

    private int clamp(int quantity) {
        return Math.max(1, Math.min(MAX_QUANTITY, quantity));
    }
}
