package fr.miage.edumatch.tutor.web;

import fr.miage.edumatch.tutor.domain.Tutor;
import fr.miage.edumatch.tutor.domain.TutorRepository;
import fr.miage.edumatch.tutor.dto.CreateTutorRequest;
import fr.miage.edumatch.tutor.dto.TutorResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tutors")
public class TutorController {

    private final TutorRepository tutors;

    public TutorController(TutorRepository tutors) {
        this.tutors = tutors;
    }

    @PostMapping
    public ResponseEntity<TutorResponse> create(@AuthenticationPrincipal String userId,
                                                @Valid @RequestBody CreateTutorRequest req) {
        UUID uid = UUID.fromString(userId);
        tutors.findByUserId(uid).ifPresent(t -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "tutor profile already exists");
        });
        Tutor saved = tutors.save(Tutor.builder()
                .userId(uid)
                .fullName(req.fullName())
                .subjects(req.subjects())
                .hourlyRateCents(req.hourlyRateCents())
                .bio(req.bio())
                .yearsExperience(req.yearsExperience())
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(TutorResponse.from(saved));
    }

    @GetMapping
    public List<TutorResponse> list(@RequestParam(required = false) String subject) {
        List<Tutor> rows = (subject == null) ? tutors.findAll() : tutors.findBySubject(subject);
        return rows.stream().map(TutorResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TutorResponse byId(@PathVariable UUID id) {
        return tutors.findById(id).map(TutorResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
