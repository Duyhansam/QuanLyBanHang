package com.kanza.store.dto;

import com.kanza.store.entity.CartItem;
import com.kanza.store.entity.Product;

public record CartItemDto(String cartItemId, Integer quantity, String selectedSize, Long variantId,
        Product product) {

    public static CartItemDto from(CartItem c) {
        return new CartItemDto(c.getCartItemId(), c.getQuantity(), c.getSelectedSize(), c.getVariantId(),
                c.getProduct());
    }
}
