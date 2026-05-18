package fr.miage.edumatch.user.dto;

public record AuthResponse(String accessToken, long expiresInSeconds, UserResponse user) {}
