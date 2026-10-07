package com.kanza.store.dto;

// confirmPassword do React gửi kèm sẽ bị bỏ qua (field lạ không được map)
public record RegisterRequest(String fullName, String email, String password) {
}