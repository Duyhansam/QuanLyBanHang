package com.kanza.store.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kanza.store.dto.WishlistItemDto;
import com.kanza.store.dto.WishlistMergeRequest;
import com.kanza.store.dto.WishlistRequest;
import com.kanza.store.service.WishlistService;

// Tất cả đường dẫn /api/wishlist/** đã được SecurityConfig bắt buộc đăng nhập
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    // GET /api/wishlist
    @GetMapping
    public ResponseEntity<List<WishlistItemDto>> getWishlist(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId(jwt)));
    }

    // POST /api/wishlist   { "productId": 12, "variantId": 34 }
    @PostMapping
    public ResponseEntity<List<WishlistItemDto>> add(@AuthenticationPrincipal Jwt jwt,
            @RequestBody WishlistRequest req) {
        return ResponseEntity.ok(wishlistService.add(userId(jwt), req));
    }

    // DELETE /api/wishlist/12
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        wishlistService.remove(userId(jwt), productId);
        return ResponseEntity.noContent().build();
    }

    // POST /api/wishlist/merge   { "items": [ { "productId": 1, "variantId": null } ] }
    @PostMapping("/merge")
    public ResponseEntity<List<WishlistItemDto>> merge(@AuthenticationPrincipal Jwt jwt,
            @RequestBody WishlistMergeRequest req) {
        return ResponseEntity.ok(wishlistService.merge(userId(jwt), req.items()));
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
