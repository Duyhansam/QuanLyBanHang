package com.kanza.store.dto;

import java.util.List;

public record CartMergeRequest(List<CartItemRequest> items) {
}
