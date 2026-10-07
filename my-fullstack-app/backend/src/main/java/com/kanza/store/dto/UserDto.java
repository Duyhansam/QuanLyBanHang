package com.kanza.store.dto;

import com.kanza.store.entity.User;

// Dữ liệu user an toàn để trả về React (không có passwordHash)
public record UserDto(Long id, String fullName, String email, String role) {

    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole());
    }
}