package com.kanza.store.review;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewDto(Long id, Long userId, String userName, Integer rating, String comment,
        LocalDateTime createdAt) {

    public static ReviewDto from(Review r) {
        return new ReviewDto(r.getId(), r.getUserId(), r.getUserName(), r.getRating(), r.getComment(),
                r.getCreatedAt());
    }

    // Tổng hợp hiển thị đầu phần đánh giá: điểm trung bình, tổng số, danh sách
    public record Summary(double average, long count, List<ReviewDto> reviews) {
    }

    // Trạng thái của người đang đăng nhập với sản phẩm này
    public record Mine(boolean canReview, ReviewDto review) {
    }
}
