package com.kanza.store.dto;

import com.kanza.store.entity.Product;
import com.kanza.store.entity.WishlistItem;

public record WishlistItemDto(Product product, Long variantId) {

    public static WishlistItemDto from(WishlistItem w) {
        return new WishlistItemDto(w.getProduct(), w.getVariantId());
    }
}
