package com.kanza.store.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kanza.store.auth.User;
import com.kanza.store.auth.UserRepository;
import com.kanza.store.exception.ApiException;
import com.kanza.store.order.OrderRepository;
import com.kanza.store.product.ProductRepository;

@Service
public class ReviewService {

    // true: chỉ người đã NHẬN HÀNG (đơn DELIVERED có sản phẩm này) mới được đánh giá -> chống đánh giá ảo.
    // Muốn thử nhanh khi chưa có đơn nào giao xong thì tạm đổi thành false.
    private static final boolean REQUIRE_PURCHASE = true;

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
            OrderRepository orderRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ReviewDto.Summary list(Long productId) {
        List<ReviewDto> reviews = reviewRepository.findTop50ByProductIdOrderByIdDesc(productId).stream()
                .map(ReviewDto::from).toList();
        long count = reviewRepository.countByProductId(productId);
        Double avg = reviewRepository.averageRating(productId);
        double average = avg == null ? 0 : Math.round(avg * 10.0) / 10.0;
        return new ReviewDto.Summary(average, count, reviews);
    }

    @Transactional(readOnly = true)
    public ReviewDto.Mine mine(Long userId, Long productId) {
        ReviewDto mine = reviewRepository.findByProductIdAndUserId(productId, userId)
                .map(ReviewDto::from).orElse(null);
        return new ReviewDto.Mine(canReview(userId, productId), mine);
    }

    // Viết đánh giá mới, hoặc sửa đánh giá cũ của chính mình
    @Transactional
    public ReviewDto save(Long userId, ReviewRequest req) {
        if (req == null || req.productId() == null) {
            throw bad("Invalid product!");
        }
        int rating = req.rating() == null ? 0 : req.rating();
        if (rating < 1 || rating > 5) {
            throw bad("Please choose a rating from 1 to 5 stars!");
        }
        String comment = req.comment() == null ? null : req.comment().trim();
        if (comment != null && comment.isEmpty()) {
            comment = null;
        }
        if (comment != null && comment.length() > 1000) {
            throw bad("Review is too long (max 1000 characters)!");
        }
        if (!productRepository.existsById(req.productId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Product does not exist!");
        }
        if (!canReview(userId, req.productId())) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You can only review a product after you have received it!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account does not exist!"));

        Review review = reviewRepository.findByProductIdAndUserId(req.productId(), userId)
                .orElseGet(Review::new);
        review.setProductId(req.productId());
        review.setUserId(userId);
        review.setUserName(user.getFullName());
        review.setRating(rating);
        review.setComment(comment);
        return ReviewDto.from(reviewRepository.save(review));
    }

    // Chủ đánh giá hoặc admin được xóa
    @Transactional
    public void delete(Long userId, boolean isAdmin, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found!"));
        if (!isAdmin && !review.getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You don't have permission to delete this review!");
        }
        reviewRepository.delete(review);
    }

    private boolean canReview(Long userId, Long productId) {
        return !REQUIRE_PURCHASE || orderRepository.countDeliveredWithProduct(userId, productId) > 0;
    }

    private static ApiException bad(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
