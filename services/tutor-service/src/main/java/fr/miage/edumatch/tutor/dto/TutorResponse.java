package fr.miage.edumatch.tutor.dto;

import fr.miage.edumatch.tutor.domain.Tutor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record TutorResponse(
        UUID id,
        UUID userId,
        String fullName,
        Set<String> subjects,
        int hourlyRateCents,
        String bio,
        int yearsExperience,
        Instant createdAt
) {
    public static TutorResponse from(Tutor t) {
        return new TutorResponse(t.getId(), t.getUserId(), t.getFullName(), t.getSubjects(),
                t.getHourlyRateCents(), t.getBio(), t.getYearsExperience(), t.getCreatedAt());
    }
}
