package fr.miage.edumatch.tutor.dto;

import jakarta.validation.constraints.*;

import java.util.Set;

public record CreateTutorRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotNull @Size(min = 1, max = 10) Set<@NotBlank String> subjects,
        @Min(0) int hourlyRateCents,
        @Size(max = 2000) String bio,
        @Min(0) @Max(80) int yearsExperience
) {}
