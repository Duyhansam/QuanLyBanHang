package com.kanza.store.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kanza.store.dto.CartItemDto;
import com.kanza.store.dto.CartItemRequest;
import com.kanza.store.dto.CartMergeRequest;
import com.kanza.store.dto.QuantityRequest;
import com.kanza.store.service.CartService;

// Tất cả đường dẫn /api/cart/** đã được SecurityConfig bắt buộc đăng nhập
@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // GET /api/cart
    @GetMapping
    public ResponseEntity<List<CartItemDto>> getCart(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.getCart(userId(jwt)));
    }

    // POST /api/cart   { cartItemId, productId, variantId, selectedSize, quantity }
    @PostMapping
    public ResponseEntity<List<CartItemDto>> add(@AuthenticationPrincipal Jwt jwt,
            @RequestBody CartItemRequest req) {
        return ResponseEntity.ok(cartService.add(userId(jwt), req));
    }

    // PUT /api/cart/quantity   { cartItemId, quantity }
    @PutMapping("/quantity")
    public ResponseEntity<Void> setQuantity(@AuthenticationPrincipal Jwt jwt, @RequestBody QuantityRequest req) {
        cartService.setQuantity(userId(jwt), req.cartItemId(), req.quantity());
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/cart/item?cartItemId=1-M-3
    @DeleteMapping("/item")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal Jwt jwt, @RequestParam String cartItemId) {
        cartService.remove(userId(jwt), cartItemId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/cart
    @DeleteMapping
    public ResponseEntity<Void> clear(@AuthenticationPrincipal Jwt jwt) {
        cartService.clear(userId(jwt));
        return ResponseEntity.noContent().build();
    }

    // POST /api/cart/merge   { "items": [ ... ] }
    @PostMapping("/merge")
    public ResponseEntity<List<CartItemDto>> merge(@AuthenticationPrincipal Jwt jwt,
            @RequestBody CartMergeRequest req) {
        return ResponseEntity.ok(cartService.merge(userId(jwt), req.items()));
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
