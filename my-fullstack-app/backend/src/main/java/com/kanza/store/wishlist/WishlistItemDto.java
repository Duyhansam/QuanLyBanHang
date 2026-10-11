package com.kanza.store.wishlist;

import com.kanza.store.product.Product;

public record WishlistItemDto(Product product, Long variantId) {

    public static WishlistItemDto from(WishlistItem w) {
        return new WishlistItemDto(w.getProduct(), w.getVariantId());
    }
}
