package com.kanza.store.order;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Tất cả đường dẫn /api/admin/** đã được SecurityConfig giới hạn cho role ADMIN
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /api/admin/orders            -> mọi đơn hàng
    // GET /api/admin/orders?status=PENDING
    @GetMapping
    public ResponseEntity<List<OrderDto>> list(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.adminList(status));
    }

    // GET /api/admin/orders/12
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.adminGet(id));
    }

    // PATCH /api/admin/orders/12/status   { "status": "CONFIRMED" }
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateRequest req) {
        return ResponseEntity.ok(orderService.adminUpdateStatus(id, req == null ? null : req.status()));
    }
}
