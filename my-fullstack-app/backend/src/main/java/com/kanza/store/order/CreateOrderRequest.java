package com.kanza.store.order;

import java.util.List;

// items = null hoặc rỗng  -> đặt hàng toàn bộ giỏ hàng trên server (rồi xóa giỏ)
// items có dữ liệu       -> "Mua ngay": chỉ đặt các sản phẩm này, không đụng tới giỏ
public record CreateOrderRequest(
        String fullName,
        String phone,
        String address,
        String city,
        String note,
        String paymentMethod,
        List<OrderItemRequest> items) {
}
