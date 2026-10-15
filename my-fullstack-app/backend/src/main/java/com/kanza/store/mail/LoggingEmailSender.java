package com.kanza.store.mail;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

// Bản dùng khi phát triển: KHÔNG gửi mail thật, chỉ in nội dung ra console của Spring Boot.
// Khi có SMTP, tạo class khác implements EmailSender (và xóa @Component ở class này).
@Component
public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void send(String to, String subject, String body) {
        log.info("\n===== EMAIL (not actually sent) =====\nTo: {}\nSubject: {}\n\n{}\n=================================",
                to, subject, body);
    }
}
