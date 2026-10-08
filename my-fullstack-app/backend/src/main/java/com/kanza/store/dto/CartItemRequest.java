package com.kanza.store.dto;

public record CartItemRequest(String cartItemId, Long productId, Long variantId, String selectedSize,
        Integer quantity) {
}
