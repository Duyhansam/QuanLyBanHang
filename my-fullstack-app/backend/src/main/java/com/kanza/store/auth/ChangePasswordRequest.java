package com.kanza.store.auth;

public record ChangePasswordRequest(String currentPassword, String newPassword) {
}
