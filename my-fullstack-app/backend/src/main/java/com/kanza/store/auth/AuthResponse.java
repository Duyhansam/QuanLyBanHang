package com.kanza.store.auth;

public record AuthResponse(String token, UserDto user) {
}