package com.kanza.store.product;

import java.util.List;
import java.util.Map;

// Dữ liệu trang admin gửi lên khi thêm / sửa sản phẩm
public record AdminProductRequest(
        String name,
        Double price,
        Double originalPrice, // chỉ điền khi sản phẩm đang giảm giá
        String badge,
        String description,
        String category,      // MEN, WOMEN, KID, SHOP, BESTSELLER, SALE, CATEGORY
        String type,          // BOOTS, RUNNING, WALKING...
        String color,
        Long brandId,
        List<VariantRequest> variants,
        Map<String, Integer> sizeStocks) { // tồn kho theo size { "36": 5, ... }; null = giữ nguyên, {} = bỏ quản lý tồn kho

    // id = null: màu mới. Có id: sửa màu đã có (giữ nguyên id để giỏ hàng/wishlist không bị lệch)
    public record VariantRequest(Long id, String colorName, String image, String thumbnail) {
    }
}
