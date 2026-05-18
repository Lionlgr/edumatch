package fr.miage.edumatch.tutor.grpc;

import fr.miage.edumatch.tutor.domain.Tutor;
import fr.miage.edumatch.tutor.domain.TutorRepository;
import fr.miage.edumatch.tutor.grpc.proto.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@GrpcService
public class TutorMatcherService extends TutorMatcherGrpc.TutorMatcherImplBase {

    private final TutorRepository repo;

    public TutorMatcherService(TutorRepository repo) {
        this.repo = repo;
    }

    @Override
    public void matchTutors(MatchRequest request, StreamObserver<TutorMatch> responseObserver) {
        Set<String> wanted = request.getSubjectsList().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
        int maxCents = request.getMaxHourlyRateCents();
        int limit = request.getLimit() > 0 ? request.getLimit() : 10;

        List<TutorMatch> ranked = repo.findAll().stream()
                .filter(t -> maxCents == 0 || t.getHourlyRateCents() <= maxCents)
                .map(t -> TutorMatch.newBuilder()
                        .setProfile(toProfile(t))
                        .setScore(cosineSimilarity(wanted, normalize(t.getSubjects())))
                        .build())
                .filter(m -> m.getScore() > 0)
                .sorted(Comparator.comparingDouble(TutorMatch::getScore).reversed())
                .limit(limit)
                .toList();

        ranked.forEach(responseObserver::onNext);
        responseObserver.onCompleted();
    }

    @Override
    public void getTutor(GetTutorRequest request, StreamObserver<TutorProfile> responseObserver) {
        UUID id;
        try {
            id = UUID.fromString(request.getTutorId());
        } catch (IllegalArgumentException ex) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("tutor_id must be a UUID").asRuntimeException());
            return;
        }
        repo.findById(id).ifPresentOrElse(
                t -> {
                    responseObserver.onNext(toProfile(t));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(Status.NOT_FOUND.asRuntimeException())
        );
    }

    private static TutorProfile toProfile(Tutor t) {
        return TutorProfile.newBuilder()
                .setTutorId(t.getId().toString())
                .setUserId(t.getUserId().toString())
                .setFullName(t.getFullName())
                .addAllSubjects(t.getSubjects())
                .setHourlyRateCents(t.getHourlyRateCents())
                .setBio(t.getBio() == null ? "" : t.getBio())
                .setYearsExperience(t.getYearsExperience())
                .build();
    }

    private static Set<String> normalize(Set<String> s) {
        return s.stream().map(String::toLowerCase).collect(Collectors.toSet());
    }

    // Cosine similarity on binary subject vectors: |A ∩ B| / sqrt(|A| * |B|)
    static double cosineSimilarity(Set<String> a, Set<String> b) {
        if (a.isEmpty() || b.isEmpty()) return 0.0;
        long intersection = a.stream().filter(b::contains).count();
        return intersection / Math.sqrt((double) a.size() * b.size());
    }
}
