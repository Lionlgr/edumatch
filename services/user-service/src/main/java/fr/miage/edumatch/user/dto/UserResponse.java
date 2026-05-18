package fr.miage.edumatch.user.dto;

import fr.miage.edumatch.user.domain.Role;
import fr.miage.edumatch.user.domain.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(UUID id, String email, String fullName, Role role, Instant createdAt) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.getCreatedAt());
    }
}
