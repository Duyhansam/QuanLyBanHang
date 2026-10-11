package com.kanza.store.cart;

public record CartItemRequest(String cartItemId, Long productId, Long variantId, String selectedSize,
        Integer quantity) {
}
