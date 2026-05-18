# syntax=docker/dockerfile:1.7

# Debian-based build stage because protoc-maven-plugin downloads a glibc-linked
# protoc binary that does not run on Alpine (musl libc).
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY src ./src
RUN ./mvnw -B -ntp clean package -DskipTests \
    && mkdir -p target/dependency \
    && cd target/dependency \
    && jar -xf ../*.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

ARG DEP=/workspace/target/dependency
COPY --from=build ${DEP}/BOOT-INF/lib /app/lib
COPY --from=build ${DEP}/META-INF /app/META-INF
COPY --from=build ${DEP}/BOOT-INF/classes /app

EXPOSE 8080 9090

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -cp /app:/app/lib/* fr.miage.edumatch.tutor.TutorServiceApplication"]
