package com.kanza.store.order;

// Body của PATCH /api/admin/orders/{id}/status
public record StatusUpdateRequest(String status) {
}
