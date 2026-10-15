package com.kanza.store.cart;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.exception.ApiException;
import com.kanza.store.product.Product;
import com.kanza.store.product.ProductRepository;
import com.kanza.store.product.StockService;

@Service
public class CartService {

    private static final int MAX_QUANTITY = 99;

    private final CartItemRepository cartRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;

    public CartService(CartItemRepository cartRepository, ProductRepository productRepository,
            StockService stockService) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public List<CartItemDto> getCart(Long userId) {
        return cartRepository.findByUserIdOrderByIdAsc(userId).stream().map(CartItemDto::from).toList();
    }

    // Thêm vào giỏ: cùng cartItemId thì cộng dồn số lượng
    @Transactional
    public List<CartItemDto> add(Long userId, CartItemRequest req) {
        Product product = findProduct(req)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product does not exist!"));
        upsert(userId, product, req, true); // thêm thủ công: quá tồn kho thì báo lỗi
        return getCart(userId);
    }

    @Transactional
    public void setQuantity(Long userId, String cartItemId, Integer quantity) {
        CartItem item = cartRepository.findByUserIdAndCartItemId(userId, cartItemId == null ? "" : cartItemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product is not in your cart!"));
        int wanted = clamp(quantity == null ? 1 : quantity);
        Integer available = stockService.available(item.getProduct().getId(), item.getSelectedSize());
        // Giảm số lượng luôn được phép; chỉ chặn khi TĂNG vượt quá tồn kho
        if (available != null && wanted > available && wanted > item.getQuantity()) {
            throw StockService.outOfStock(item.getProduct().getName(), item.getSelectedSize(), available);
        }
        item.setQuantity(wanted);
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
                findProduct(req).ifPresent(product -> upsert(userId, product, req, false)); // gộp giỏ khách: tự giảm cho vừa tồn kho
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

    private void upsert(Long userId, Product product, CartItemRequest req, boolean strict) {
        Long variantId = req.variantId() != null
                && product.getVariants().stream().anyMatch(v -> req.variantId().equals(v.getId()))
                        ? req.variantId()
                        : null;

        String size = req.selectedSize() == null || req.selectedSize().isBlank() ? "40" : req.selectedSize().trim();
        if (size.length() > 20) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid size!");
        }

        String key = req.cartItemId() == null || req.cartItemId().isBlank()
                ? product.getId() + "-" + size + "-" + (variantId == null ? "default" : variantId)
                : req.cartItemId().trim();
        if (key.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid cart item code!");
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
        int wanted = Math.min(MAX_QUANTITY, item.getQuantity() + quantity);
        Integer available = stockService.available(product.getId(), size);
        if (available != null) {
            if (strict && wanted > available) {
                throw StockService.outOfStock(product.getName(), size, available);
            }
            wanted = Math.min(wanted, available);
            if (wanted <= 0) {
                return; // gộp giỏ: size đã hết hàng thì bỏ qua dòng này
            }
        }
        item.setQuantity(wanted);
        cartRepository.save(item);
    }

    private int clamp(int quantity) {
        return Math.max(1, Math.min(MAX_QUANTITY, quantity));
    }
}
