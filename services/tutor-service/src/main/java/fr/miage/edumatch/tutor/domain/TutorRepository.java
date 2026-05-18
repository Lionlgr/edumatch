package fr.miage.edumatch.tutor.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TutorRepository extends JpaRepository<Tutor, UUID> {

    Optional<Tutor> findByUserId(UUID userId);

    @Query("SELECT DISTINCT t FROM Tutor t JOIN t.subjects s WHERE LOWER(s) = LOWER(:subject)")
    List<Tutor> findBySubject(@Param("subject") String subject);
}
