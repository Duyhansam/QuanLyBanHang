package com.kanza.store.review;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // GET /api/reviews/product/5  (công khai)
    @GetMapping("/product/{productId}")
    public ResponseEntity<ReviewDto.Summary> list(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.list(productId));
    }

    // GET /api/reviews/mine?productId=5  (cần đăng nhập): mình có được đánh giá không + đánh giá cũ của mình
    @GetMapping("/mine")
    public ResponseEntity<ReviewDto.Mine> mine(@AuthenticationPrincipal Jwt jwt, @RequestParam Long productId) {
        return ResponseEntity.ok(reviewService.mine(userId(jwt), productId));
    }

    // POST /api/reviews   { productId, rating, comment }  (cần đăng nhập)
    @PostMapping
    public ResponseEntity<ReviewDto> save(@AuthenticationPrincipal Jwt jwt, @RequestBody ReviewRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.save(userId(jwt), req));
    }

    // DELETE /api/reviews/12  (chủ đánh giá hoặc ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        reviewService.delete(userId(jwt), isAdmin, id);
        return ResponseEntity.noContent().build();
    }

    private Long userId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
