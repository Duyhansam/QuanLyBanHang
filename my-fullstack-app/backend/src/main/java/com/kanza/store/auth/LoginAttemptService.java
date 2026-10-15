package com.kanza.store.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

/**
 * Chặn dò mật khẩu (brute force) bằng bộ đếm lần đăng nhập sai, lưu trong RAM.
 *
 * Hai lớp chặn:
 *  - Theo cặp (email + IP): sai MAX_FAILS_PER_ACCOUNT_IP lần -> khóa LOCK_TIME.
 *    Dùng cặp (không chỉ email) để kẻ xấu không thể cố tình khóa tài khoản người khác từ máy của họ.
 *  - Theo IP: sai MAX_FAILS_PER_IP lần (thử nhiều email khác nhau) -> khóa cả IP đó.
 *
 * Lưu ý: dữ liệu mất khi restart server và chỉ đúng với 1 instance. Khi lên production
 * nhiều server thì chuyển sang Redis hoặc lưu bảng trong MySQL.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_FAILS_PER_ACCOUNT_IP = 5;
    private static final int MAX_FAILS_PER_IP = 20;
    private static final Duration WINDOW = Duration.ofMinutes(15); // sai rải rác quá lâu thì đếm lại từ đầu
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);
    private static final int CLEANUP_THRESHOLD = 10_000;

    private static class Entry {
        int fails;
        Instant windowStart;
        Instant lockedUntil; // null = chưa bị khóa
    }

    private final Map<String, Entry> entries = new ConcurrentHashMap<>();

    /** Số giây còn bị khóa (0 nếu được phép thử). */
    public long secondsUntilUnlocked(String email, String ip) {
        return Math.max(remaining(accountKey(email, ip)), remaining(ipKey(ip)));
    }

    public void recordFailure(String email, String ip) {
        fail(accountKey(email, ip), MAX_FAILS_PER_ACCOUNT_IP);
        fail(ipKey(ip), MAX_FAILS_PER_IP);
    }

    /** Đăng nhập đúng: chỉ xóa bộ đếm của cặp email + IP, giữ bộ đếm IP để chống dò nhiều email. */
    public void recordSuccess(String email, String ip) {
        entries.remove(accountKey(email, ip));
    }

    private void fail(String key, int max) {
        Instant now = Instant.now();
        if (entries.size() > CLEANUP_THRESHOLD) {
            entries.values().removeIf(e -> isExpired(e, now));
        }
        entries.compute(key, (k, e) -> {
            if (e == null || isExpired(e, now)) {
                e = new Entry();
                e.windowStart = now;
            }
            if (e.lockedUntil != null) {
                return e; // đang khóa rồi, không kéo dài thêm
            }
            e.fails++;
            if (e.fails >= max) {
                e.lockedUntil = now.plus(LOCK_TIME);
            }
            return e;
        });
    }

    private long remaining(String key) {
        Entry e = entries.get(key);
        if (e == null || e.lockedUntil == null) {
            return 0;
        }
        long ms = Duration.between(Instant.now(), e.lockedUntil).toMillis();
        return ms <= 0 ? 0 : (ms + 999) / 1000;
    }

    private boolean isExpired(Entry e, Instant now) {
        if (e.lockedUntil != null) {
            return now.isAfter(e.lockedUntil);
        }
        return now.isAfter(e.windowStart.plus(WINDOW));
    }

    private String accountKey(String email, String ip) {
        return "acc:" + email + "|" + ip;
    }

    private String ipKey(String ip) {
        return "ip:" + ip;
    }
}
