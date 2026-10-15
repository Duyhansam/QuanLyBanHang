package com.kanza.store.exception;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

// Mọi lỗi trả về dạng { "message": "..." } để React hiển thị luôn.
// Lỗi bất ngờ chỉ được ghi vào log của server, KHÔNG gửi chi tiết ra ngoài.
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Lỗi nghiệp vụ do mình chủ động ném ra
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApi(ApiException ex) {
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(ex.getStatus());
        if (ex.getRetryAfterSeconds() != null) {
            builder.header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()));
        }
        return builder.body(Map.of("message", ex.getMessage()));
    }

    // JSON gửi lên sai định dạng, thiếu dấu ngoặc, sai kiểu dữ liệu...
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        return body(HttpStatus.BAD_REQUEST, "Invalid request data!");
    }

    // Ví dụ /api/products/abc (id phải là số) hoặc thiếu tham số bắt buộc
    @ExceptionHandler({ MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class })
    public ResponseEntity<Map<String, String>> handleBadParam(Exception ex) {
        return body(HttpStatus.BAD_REQUEST, "Invalid parameter!");
    }

    // Upload vượt giới hạn spring.servlet.multipart.max-file-size
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleTooLarge(MaxUploadSizeExceededException ex) {
        return body(HttpStatus.PAYLOAD_TOO_LARGE, "Image is too large (max 5MB)!");
    }

    // Dữ liệu vi phạm ràng buộc của DB (quá dài, trùng khóa...)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation", ex);
        return body(HttpStatus.CONFLICT, "Invalid data, or it already exists!");
    }

    // Còn lại: lỗi chưa lường trước
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOther(Exception ex) throws Exception {
        // Để Spring Security tự trả 401 / 403, không biến thành lỗi 500
        if (ex instanceof AccessDeniedException || ex instanceof AuthenticationException) {
            throw ex;
        }
        // Lỗi chuẩn của Spring (404 đường dẫn không có, 405 sai phương thức...) giữ đúng mã lỗi
        if (ex instanceof ErrorResponse er) {
            HttpStatus status = HttpStatus.resolve(er.getStatusCode().value());
            if (status == HttpStatus.NOT_FOUND) {
                return body(status, "Not found!");
            }
            if (status == HttpStatus.METHOD_NOT_ALLOWED) {
                return body(status, "Method not allowed!");
            }
            return body(status == null ? HttpStatus.BAD_REQUEST : status, "Invalid request!");
        }
        log.error("Unexpected error", ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong. Please try again later!");
    }

    private ResponseEntity<Map<String, String>> body(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
