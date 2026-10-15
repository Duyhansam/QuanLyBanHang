package com.kanza.store.order;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Tất cả đường dẫn /api/orders/** đã được SecurityConfig bắt buộc đăng nhập
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // POST /api/orders
    @PostMapping
    public ResponseEntity<OrderDto> create(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.create(userId(jwt), req));
    }

    // GET /api/orders  (lịch sử đơn hàng của tôi)
    @GetMapping
    public ResponseEntity<List<OrderDto>> list(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(orderService.list(userId(jwt)));
    }

    // GET /api/orders/12
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> get(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.get(userId(jwt), id));
    }

    // POST /api/orders/12/cancel
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDto> cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancel(userId(jwt), id));
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
