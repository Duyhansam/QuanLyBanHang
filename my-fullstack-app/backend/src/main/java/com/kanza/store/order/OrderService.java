package com.kanza.store.order;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.cart.CartItem;
import com.kanza.store.cart.CartItemRepository;
import com.kanza.store.exception.ApiException;
import com.kanza.store.product.Product;
import com.kanza.store.product.ProductRepository;
import com.kanza.store.product.ProductVariant;
import com.kanza.store.product.StockService;

@Service
public class OrderService {

    private static final double FREE_SHIPPING_OVER = 500; // tạm tính > 500 thì miễn phí vận chuyển
    private static final double SHIPPING_FEE = 15;
    private static final int MAX_QUANTITY = 99;
    private static final Set<String> PAYMENT_METHODS = Set.of("COD", "BANKING");

    // Trạng thái tiếp theo được phép. DELIVERED và CANCELLED là trạng thái cuối.
    private static final Map<String, Set<String>> NEXT_STATUS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("SHIPPING", "CANCELLED"),
            "SHIPPING", Set.of("DELIVERED"),
            "DELIVERED", Set.of(),
            "CANCELLED", Set.of());

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartRepository;
    private final StockService stockService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
            CartItemRepository cartRepository, StockService stockService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.stockService = stockService;
    }

    // Một dòng sản phẩm đã được kiểm tra, sẵn sàng đưa vào đơn
    private record Line(Product product, Long variantId, String size, int quantity) {
    }

    // @Transactional: cả hàm chạy trong MỘT giao dịch DB. Kiểm tra hàng, trừ kho, lưu đơn, xóa giỏ hoặc cùng thành công
    // hoặc cùng bị hủy (rollback) nếu có lỗi giữa chừng (ví dụ hết hàng ở sản phẩm thứ 3 thì 2 sản phẩm trước cũng không bị trừ kho).
    @Transactional
    public OrderDto create(Long userId, CreateOrderRequest req) {
        if (req == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid order data!");
        }
        String fullName = required(req.fullName(), "Full name", 100);
        String phone = required(req.phone(), "Phone number", 20);
        String address = required(req.address(), "Address", 255);
        if (!phone.matches("^[0-9+\\-\\s().]{8,20}$")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid phone number!");
        }
        String payment = req.paymentMethod() == null ? "" : req.paymentMethod().trim().toUpperCase();
        if (!PAYMENT_METHODS.contains(payment)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid payment method!");
        }

        // "Mua ngay" gửi kèm danh sách items; thanh toán giỏ hàng thì items để trống và backend tự lấy giỏ của người dùng.
        boolean buyNow = req.items() != null && !req.items().isEmpty();
        List<Line> lines = buyNow ? linesFromRequest(req.items()) : linesFromCart(userId);
        if (lines.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "There are no products to order!");
        }

        ShopOrder order = new ShopOrder();
        order.setUserId(userId);
        order.setFullName(fullName);
        order.setPhone(phone);
        order.setAddress(address);
        order.setCity(optional(req.city(), 100));
        order.setNote(optional(req.note(), 500));
        order.setPaymentMethod(payment);

        double subtotal = 0;
        for (Line line : lines) {
            Product p = line.product();
            ProductVariant variant = pickVariant(p, line.variantId());

            // Trừ kho ngay trong giao dịch đặt hàng. Hết hàng -> ném lỗi 409, cả đơn bị hủy, giỏ giữ nguyên.
            stockService.reserve(p.getId(), p.getName(), line.size(), line.quantity());

            OrderItem item = new OrderItem();
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setImage(variant != null ? variant.getImage() : null);
            item.setColorName(variant != null ? variant.getColorName() : null);
            item.setSelectedSize(line.size());
            item.setUnitPrice(p.getPrice()); // giá lấy từ DB, không tin giá từ trình duyệt
            item.setQuantity(line.quantity());
            order.addItem(item);

            subtotal += p.getPrice() * line.quantity();
        }
        subtotal = round2(subtotal);
        double shipping = subtotal > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTotal(round2(subtotal + shipping));

        ShopOrder saved = orderRepository.save(order);

        // Đặt cả giỏ hàng thì xóa giỏ ngay trong cùng giao dịch:
        // lưu đơn thất bại thì giỏ vẫn còn nguyên
        if (!buyNow) {
            cartRepository.deleteByUserId(userId);
        }
        return OrderDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> list(Long userId) {
        return orderRepository.findByUserIdOrderByIdDesc(userId).stream().map(OrderDto::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto get(Long userId, Long orderId) {
        return OrderDto.from(find(userId, orderId));
    }

    // Khách chỉ hủy được đơn đang chờ xác nhận
    @Transactional
    public OrderDto cancel(Long userId, Long orderId) {
        ShopOrder order = find(userId, orderId);
        if (!ShopOrder.PENDING.equals(order.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only orders that are awaiting confirmation can be cancelled!");
        }
        order.setStatus(ShopOrder.CANCELLED);
        restock(order); // trả hàng về kho
        return OrderDto.from(orderRepository.save(order));
    }

    // ---------- dành cho admin ----------

    @Transactional(readOnly = true)
    public List<OrderDto> adminList(String status) {
        List<ShopOrder> orders;
        if (status == null || status.isBlank()) {
            orders = orderRepository.findAllByOrderByIdDesc();
        } else {
            String s = status.trim().toUpperCase();
            if (!NEXT_STATUS.containsKey(s)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status!");
            }
            orders = orderRepository.findByStatusOrderByIdDesc(s);
        }
        return orders.stream().map(OrderDto::from).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto adminGet(Long orderId) {
        return OrderDto.from(findAny(orderId));
    }

    // Chỉ cho đi theo đúng luồng: PENDING -> CONFIRMED -> SHIPPING -> DELIVERED
    // (hoặc hủy khi chưa giao). Không cho nhảy cóc hay quay lui.
    @Transactional
    public OrderDto adminUpdateStatus(Long orderId, String newStatus) {
        String target = newStatus == null ? "" : newStatus.trim().toUpperCase();
        if (!NEXT_STATUS.containsKey(target)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status!");
        }
        ShopOrder order = findAny(orderId);
        Set<String> allowed = NEXT_STATUS.getOrDefault(order.getStatus(), Set.of());
        if (!allowed.contains(target)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Cannot change order status from " + order.getStatus() + " to " + target + "!");
        }
        order.setStatus(target);
        if (ShopOrder.CANCELLED.equals(target)) {
            restock(order); // admin hủy đơn cũng trả hàng về kho
        }
        return OrderDto.from(orderRepository.save(order));
    }

    // ---------- hàm phụ ----------

    // CANCELLED là trạng thái cuối nên mỗi đơn chỉ được trả kho đúng 1 lần
    private void restock(ShopOrder order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                stockService.release(item.getProductId(), item.getSelectedSize(), item.getQuantity());
            }
        }
    }

    private ShopOrder findAny(Long orderId) {
        return orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found!"));
    }

    private ShopOrder find(Long userId, Long orderId) {
        return orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found!"));
    }

    private List<Line> linesFromCart(Long userId) {
        return cartRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map((CartItem c) -> new Line(c.getProduct(), c.getVariantId(), c.getSelectedSize(),
                        c.getQuantity()))
                .toList();
    }

    private List<Line> linesFromRequest(List<OrderItemRequest> items) {
        return items.stream().map(r -> {
            if (r == null || r.productId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid product!");
            }
            Product product = productRepository.findById(r.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product does not exist!"));
            int quantity = r.quantity() == null ? 1 : r.quantity();
            if (quantity < 1 || quantity > MAX_QUANTITY) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be between 1 and " + MAX_QUANTITY + "!");
            }
            String size = r.selectedSize() == null || r.selectedSize().isBlank() ? "40" : r.selectedSize().trim();
            if (size.length() > 20) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid size!");
            }
            return new Line(product, r.variantId(), size, quantity);
        }).toList();
    }

    // Lấy đúng biến thể (màu) khách chọn, không có thì lấy biến thể đầu tiên
    private ProductVariant pickVariant(Product p, Long variantId) {
        if (p.getVariants() == null || p.getVariants().isEmpty()) {
            return null;
        }
        if (variantId != null) {
            for (ProductVariant v : p.getVariants()) {
                if (variantId.equals(v.getId())) {
                    return v;
                }
            }
        }
        return p.getVariants().get(0);
    }

    private String required(String value, String label, int maxLength) {
        String v = value == null ? "" : value.trim();
        if (v.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " is required!");
        }
        if (v.length() > maxLength) {
            throw new ApiException(HttpStatus.BAD_REQUEST, label + " is too long!");
        }
        return v;
    }

    private String optional(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String v = value.trim();
        return v.length() > maxLength ? v.substring(0, maxLength) : v;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
