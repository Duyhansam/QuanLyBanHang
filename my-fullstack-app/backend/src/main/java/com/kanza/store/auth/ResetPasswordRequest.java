package com.kanza.store.auth;

public record ResetPasswordRequest(String token, String password) {
}
