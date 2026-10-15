package com.kanza.store.upload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kanza.store.exception.ApiException;

// Chỉ ADMIN gọi được (SecurityConfig đã khóa /api/admin/**).
// Ảnh lưu ra thư mục ngoài project (mặc định ./uploads) và được phục vụ tại /images/uploads/** (xem WebConfig).
@RestController
@RequestMapping("/api/admin/upload")
public class UploadController {

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Path uploadDir;

    public UploadController(@Value("${app.upload.dir:uploads}") String dir) throws IOException {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
    }

    // POST /api/admin/upload   (multipart/form-data, field tên "file")  ->  { "url": "/images/uploads/xxx.png" }
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please choose an image file!");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image is too large (max 5MB)!");
        }

        // Không tin tên file hay Content-Type do trình duyệt gửi: đọc vài byte đầu để biết đúng loại ảnh
        byte[] head;
        try (InputStream in = file.getInputStream()) {
            head = in.readNBytes(12);
        }
        String ext = detectExtension(head);
        if (ext == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PNG, JPG, WEBP or GIF images are accepted!");
        }

        // Tên file do server tự sinh -> không thể ghi đè file khác hay chui ra khỏi thư mục (path traversal)
        String name = UUID.randomUUID() + "." + ext;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, uploadDir.resolve(name));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", "/images/uploads/" + name));
    }

    private static String detectExtension(byte[] h) {
        if (h.length >= 8 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G'
                && h[4] == 0x0D && h[5] == 0x0A && h[6] == 0x1A && h[7] == 0x0A) {
            return "png";
        }
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (h.length >= 6) {
            String start = new String(h, 0, 6, StandardCharsets.US_ASCII);
            if (start.equals("GIF87a") || start.equals("GIF89a")) {
                return "gif";
            }
        }
        if (h.length >= 12 && new String(h, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(h, 8, 4, StandardCharsets.US_ASCII).equals("WEBP")) {
            return "webp";
        }
        return null; // SVG và mọi định dạng khác bị từ chối (SVG có thể chứa mã script)
    }
}
