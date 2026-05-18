package fr.miage.edumatch.tutor.domain;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
public class SampleDataLoader {

    @Autowired
    private TutorRepository repo;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        if (repo.count() > 0) return;
        repo.save(Tutor.builder()
                .userId(UUID.randomUUID())
                .fullName("Marie Dubois")
                .subjects(Set.of("math", "algebra", "calculus"))
                .hourlyRateCents(3500)
                .bio("Ingénieure ENSAE, 5 ans d'expérience en cours particuliers de mathématiques.")
                .yearsExperience(5)
                .build());
        repo.save(Tutor.builder()
                .userId(UUID.randomUUID())
                .fullName("Jean Martin")
                .subjects(Set.of("physics", "math", "thermodynamics"))
                .hourlyRateCents(4000)
                .bio("Doctorant en physique, spécialiste prépa MP/PC.")
                .yearsExperience(3)
                .build());
        repo.save(Tutor.builder()
                .userId(UUID.randomUUID())
                .fullName("Sophie Laurent")
                .subjects(Set.of("english", "tofl", "literature"))
                .hourlyRateCents(2800)
                .bio("Native speaker, certifiée CELTA, prépare aux examens IELTS/TOEFL.")
                .yearsExperience(7)
                .build());
        repo.save(Tutor.builder()
                .userId(UUID.randomUUID())
                .fullName("Karim Bensalah")
                .subjects(Set.of("computer-science", "java", "algorithms"))
                .hourlyRateCents(4500)
                .bio("Ingénieur Epitech, 8 ans d'XP industrielle, passionné d'algo.")
                .yearsExperience(8)
                .build());
    }
}
