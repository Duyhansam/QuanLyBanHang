package com.kanza.store.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Phục vụ ảnh admin vừa tải lên. Dùng đường dẫn /images/uploads/** để proxy "/images" của Vite chạy luôn,
// không cần sửa vite.config.js.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final Path uploadDir;

    public WebConfig(@Value("${app.upload.dir:uploads}") String dir) throws java.io.IOException {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadDir.toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/images/uploads/**")
                .addResourceLocations(location)
                // Tên file là UUID và không bao giờ đổi nội dung nên cache lâu được
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic());
    }
}
