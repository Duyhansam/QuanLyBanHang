package com.kanza.store.mail;

// Tách việc gửi mail ra một interface để sau này đổi sang SMTP thật mà không phải sửa chỗ khác.
public interface EmailSender {

    void send(String to, String subject, String body);
}
