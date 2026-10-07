package com.kanza.store.dto;

public record AuthResponse(String token, UserDto user) {
}