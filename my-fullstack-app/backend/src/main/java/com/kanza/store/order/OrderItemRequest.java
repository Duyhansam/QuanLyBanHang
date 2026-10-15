package com.kanza.store.order;

// Một sản phẩm khách muốn mua. KHÔNG gửi giá: giá luôn được backend lấy từ DB.
public record OrderItemRequest(Long productId, Long variantId, String selectedSize, Integer quantity) {
}
