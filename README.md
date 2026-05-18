# EduMatch — Cloud Native Marketplace de Tutorat

Projet académique Master MIAGE GR2 — démontre une architecture microservices complète sur Kubernetes avec sécurité (mTLS, RBAC) et déploiement cloud (GKE).

## Architecture

```
                    ┌─────────────────┐
                    │ Istio Gateway   │  (HTTPS, mTLS terminaison externe)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼──────┐
       │   user-    │ │   tutor-   │ │  booking-   │
       │  service   │◄┤  service   │ │  service    │
       │ (Java/REST)│ │ (Java/gRPC)│ │ (Node/REST) │
       └──────┬─────┘ └──────┬─────┘ └──────┬──────┘
              │              │              │
              ▼              ▼              ▼
         PostgreSQL     PostgreSQL     PostgreSQL
         (users db)     (tutors db)    (bookings db)
```

## Services

| Service | Stack | Port | Communication | Rôle |
|---|---|---|---|---|
| `user-service` | Java 21 / Spring Boot 3 | 8080 | REST | Auth JWT, profils étudiant/tuteur |
| `tutor-service` | Java 21 / Spring Boot 3 | 9090 | gRPC + REST | Annonces, matching par compétences |
| `booking-service` | Node.js 20 / Express | 3000 | REST | Créneaux, réservations |
| `frontend` | React 18 + Vite + Tailwind | 5173 | — | UI publique |

## Stack Cloud Native

- **Conteneurisation** : Docker (multi-stage builds)
- **Orchestration** : Kubernetes (Minikube en local, GKE Autopilot en cloud)
- **Service mesh** : Istio (Gateway, VirtualService, mTLS STRICT, AuthorizationPolicy)
- **Base de données** : PostgreSQL 16 (StatefulSet, 1 DB par service)
- **Sécurité** : RBAC Kubernetes (ServiceAccount par service), JWT applicatif, mTLS Istio
- **CI/CD** : GitHub Actions (build + push Docker Hub + déploiement GKE)

## Paliers du barème

| Palier | Note | Statut |
|---|---|---|
| 1 service en local | 10/20 | 🚧 en cours |
| + Gateway locale | 12/20 | ⏳ |
| + 2e service | 14/20 | ⏳ |
| + Base de données | 16/20 | ⏳ |
| + Sécurité (RBAC + mTLS) | 18/20 | ⏳ |
| + Déploiement cloud (GKE) | 20/20 | ⏳ |

## Démarrage rapide (local)

```bash
# 1. Lancer PostgreSQL en local
docker compose -f services/user-service/docker-compose.dev.yml up -d

# 2. Lancer user-service
cd services/user-service && ./mvnw spring-boot:run

# 3. Tester
curl http://localhost:8080/actuator/health
```

## Auteurs

Binôme Master MIAGE GR2 — Université Paris.

Encadrant : Benoit Charroux.
