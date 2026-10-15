package com.kanza.store.product;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.exception.ApiException;

/**
 * Quy ước:
 *  - Sản phẩm CHƯA có dòng tồn kho nào  => không quản lý tồn kho, bán không giới hạn (giữ nguyên hành vi cũ).
 *  - Sản phẩm đã có ít nhất 1 dòng       => có quản lý; size không có dòng nào được tính là hết hàng (0).
 */
@Service
public class StockService {

    // tracked = có quản lý tồn kho hay không; sizes = { "36": 5, "37": 0, ... }
    public record StockView(boolean tracked, Map<String, Integer> sizes) {
    }

    private final ProductSizeStockRepository repository;

    public StockService(ProductSizeStockRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public StockView view(Long productId) {
        List<ProductSizeStock> rows = repository.findByProductId(productId);
        Map<String, Integer> sizes = new LinkedHashMap<>();
        rows.stream()
                .sorted(Comparator.comparing(ProductSizeStock::getShoeSize, StockService::compareSizes))
                .forEach(r -> sizes.put(r.getShoeSize(), r.getQuantity()));
        return new StockView(!rows.isEmpty(), sizes);
    }

    // Id các sản phẩm đã hết sạch hàng (để trang danh sách hiện nhãn SOLD OUT)
    @Transactional(readOnly = true)
    public List<Long> soldOutProductIds() {
        return repository.findSoldOutProductIds();
    }

    // null = không giới hạn; số >= 0 = còn lại
    @Transactional(readOnly = true)
    public Integer available(Long productId, String size) {
        if (!repository.existsByProductId(productId)) {
            return null;
        }
        return repository.findByProductIdAndShoeSize(productId, size)
                .map(ProductSizeStock::getQuantity).orElse(0);
    }

    // Trừ kho khi đặt hàng. Không đủ hàng thì ném lỗi 409 (và cả giao dịch đặt hàng bị hủy).
    @Transactional
    public void reserve(Long productId, String productName, String size, int quantity) {
        if (!repository.existsByProductId(productId)) {
            return;
        }
        if (repository.decrease(productId, size, quantity) == 0) {
            int left = repository.findByProductIdAndShoeSize(productId, size)
                    .map(ProductSizeStock::getQuantity).orElse(0);
            throw outOfStock(productName, size, left);
        }
    }

    // Cộng lại kho khi đơn bị hủy
    @Transactional
    public void release(Long productId, String size, int quantity) {
        repository.increase(productId, size, quantity);
    }

    @Transactional
    public void deleteAll(Long productId) {
        repository.deleteByProductId(productId);
    }

    // Admin lưu tồn kho. null = không gửi gì (giữ nguyên), map rỗng = tắt quản lý tồn kho.
    @Transactional
    public void replaceAll(Long productId, Map<String, Integer> requested) {
        if (requested == null) {
            return;
        }
        Map<String, Integer> clean = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> e : requested.entrySet()) {
            String size = e.getKey() == null ? "" : e.getKey().trim();
            if (size.isEmpty() || size.length() > 20) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid size!");
            }
            Integer qty = e.getValue();
            if (qty == null) {
                continue;
            }
            if (qty < 0 || qty > 100000) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Stock quantity must be between 0 and 100000!");
            }
            clean.put(size, qty);
        }
        if (clean.size() > 30) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Too many sizes!");
        }

        Map<String, ProductSizeStock> existing = repository.findByProductId(productId).stream()
                .collect(Collectors.toMap(ProductSizeStock::getShoeSize, r -> r));

        // Cập nhật / thêm trước, xóa các size không còn trong danh sách sau cùng
        for (Map.Entry<String, Integer> e : clean.entrySet()) {
            ProductSizeStock row = existing.get(e.getKey());
            if (row == null) {
                row = new ProductSizeStock();
                row.setProductId(productId);
                row.setShoeSize(e.getKey());
            }
            row.setQuantity(e.getValue());
            repository.save(row);
        }
        List<ProductSizeStock> toDelete = new ArrayList<>();
        for (ProductSizeStock row : existing.values()) {
            if (!clean.containsKey(row.getShoeSize())) {
                toDelete.add(row);
            }
        }
        repository.deleteAll(toDelete);
    }

    public static ApiException outOfStock(String productName, String size, int left) {
        String message = left <= 0
                ? productName + " (size " + size + ") is sold out!"
                : productName + " (size " + size + ") only has " + left + " left in stock!";
        return new ApiException(HttpStatus.CONFLICT, message);
    }

    // Sắp xếp size theo số (36, 37, ... 45); size không phải số thì xếp theo chữ
    private static int compareSizes(String a, String b) {
        try {
            return Double.compare(Double.parseDouble(a), Double.parseDouble(b));
        } catch (NumberFormatException ex) {
            return a.compareTo(b);
        }
    }
}
