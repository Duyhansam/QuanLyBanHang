package com.kanza.store.cart;

import com.kanza.store.product.Product;

public record CartItemDto(String cartItemId, Integer quantity, String selectedSize, Long variantId,
        Product product) {

    public static CartItemDto from(CartItem c) {
        return new CartItemDto(c.getCartItemId(), c.getQuantity(), c.getSelectedSize(), c.getVariantId(),
                c.getProduct());
    }
}
