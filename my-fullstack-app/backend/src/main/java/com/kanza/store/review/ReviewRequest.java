package com.kanza.store.review;

public record ReviewRequest(Long productId, Integer rating, String comment) {
}
