package fr.miage.edumatch.tutor.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tutors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tutor {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String fullName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tutor_subjects", joinColumns = @JoinColumn(name = "tutor_id"))
    @Column(name = "subject")
    @Builder.Default
    private Set<String> subjects = new HashSet<>();

    @Column(nullable = false)
    private int hourlyRateCents;

    @Column(length = 2000)
    private String bio;

    private int yearsExperience;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
