package com.kanza.store.cart;

import java.util.List;

public record CartMergeRequest(List<CartItemRequest> items) {
}
