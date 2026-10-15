package com.kanza.store.newsletter;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kanza.store.exception.ApiException;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final NewsletterSubscriberRepository repository;

    public NewsletterController(NewsletterSubscriberRepository repository) {
        this.repository = repository;
    }

    // POST /api/newsletter/subscribe   body: { "email": "a@b.com" }
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@RequestBody SubscribeRequest req) {
        String email = req.email() == null ? "" : req.email().trim().toLowerCase();

        if (email.length() > 254 || !EMAIL.matcher(email).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address!");
        }

        // Đã đăng ký rồi thì vẫn trả thành công (không báo lỗi, không lưu trùng)
        if (!repository.existsByEmail(email)) {
            NewsletterSubscriber subscriber = new NewsletterSubscriber();
            subscriber.setEmail(email);
            repository.save(subscriber);
        }
        return ResponseEntity.ok(Map.of("message", "Subscribed to the newsletter successfully!"));
    }
}
