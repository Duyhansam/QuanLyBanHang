package com.kanza.store.auth;

// Email không cho đổi (là tên đăng nhập)
public record UpdateProfileRequest(String fullName, String phone, String address, String city) {
}
