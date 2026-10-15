package com.kanza.store.order;

import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Long id,
        String code,
        String status,
        String fullName,
        String phone,
        String address,
        String city,
        String note,
        String paymentMethod,
        Double subtotal,
        Double shippingFee,
        Double total,
        LocalDateTime createdAt,
        List<OrderItemDto> items) {

    public record OrderItemDto(Long productId, String productName, String image, String colorName,
            String selectedSize, Double unitPrice, Integer quantity) {

        static OrderItemDto from(OrderItem i) {
            return new OrderItemDto(i.getProductId(), i.getProductName(), i.getImage(), i.getColorName(),
                    i.getSelectedSize(), i.getUnitPrice(), i.getQuantity());
        }
    }

    public static OrderDto from(ShopOrder o) {
        return new OrderDto(
                o.getId(),
                "KZ" + String.format("%06d", o.getId()),
                o.getStatus(),
                o.getFullName(),
                o.getPhone(),
                o.getAddress(),
                o.getCity(),
                o.getNote(),
                o.getPaymentMethod(),
                o.getSubtotal(),
                o.getShippingFee(),
                o.getTotal(),
                o.getCreatedAt(),
                o.getItems().stream().map(OrderItemDto::from).toList());
    }
}
