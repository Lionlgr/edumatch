# EduMatch — Rapport de projet Cloud Native

**Master MIAGE GR2 — 2025/2026**
Encadrant : Benoit Charroux
Binôme : Lionel Leguier + _[à compléter]_
Date de rendu : 7 juin 2026

---

## 1. Présentation du projet

**EduMatch** est une marketplace de tutorat universitaire deux-faces (étudiants ↔ tuteurs).
Les étudiants recherchent un tuteur par matière, consultent son profil, vérifient son tarif et ses années d'expérience ; les tuteurs publient leurs annonces avec une liste de compétences. Un algorithme de **matching par similarité cosinus** classe les tuteurs par pertinence vis-à-vis de la requête.

Le projet est un **prétexte fonctionnel** pour démontrer une architecture Cloud Native complète exigée par le sujet :

| Exigence du sujet | Implémentation EduMatch |
|---|---|
| Microservices | 2 services Java Spring Boot (user-service, tutor-service) |
| REST | Endpoints publics + endpoints sécurisés JWT |
| **gRPC (bonus)** | `TutorMatcher.MatchTutors` (server-streaming) + `GetTutor` |
| Docker | Images multi-stage publiées sur Docker Hub |
| Kubernetes | Minikube (local) — déploiement GKE Autopilot préparé |
| Gateway | Istio Gateway + VirtualService (remplace Ingress NGINX initial) |
| Base de données | 2 PostgreSQL 16 en StatefulSet (1 DB par microservice) |
| **Sécurité (RBAC, mTLS)** | Istio PeerAuthentication STRICT + AuthorizationPolicy + RBAC K8s |

---

## 2. Architecture

```
                          ┌─────────────────────────┐
                          │   curl / navigateur     │
                          │ (Host: edumatch.local)  │
                          └────────────┬────────────┘
                                       │ HTTP/1.1
                                       ▼
                          ┌─────────────────────────┐
                          │  Istio Ingress Gateway  │   ← mTLS terminé ici
                          │   (Envoy, port 80/443)  │
                          └────────────┬────────────┘
                                       │ HTTP/2 + mTLS
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌──────────────────┐   ┌──────────────────┐    ┌──────────────────┐
    │   user-service   │   │   user-service   │    │  tutor-service   │
    │  (Spring Boot)   │   │  (Spring Boot)   │    │  (Spring Boot)   │
    │  + Envoy sidecar │   │  + Envoy sidecar │    │  + Envoy sidecar │
    └────────┬─────────┘   └────────┬─────────┘    └────────┬─────────┘
             │                      │                       │
             └──────────┬───────────┘                       │
                        ▼                                   ▼
              ┌──────────────────┐                ┌──────────────────┐
              │   user-postgres  │                │  tutor-postgres  │
              │   (StatefulSet)  │                │   (StatefulSet)  │
              │  + Envoy sidecar │                │  + Envoy sidecar │
              └──────────────────┘                └──────────────────┘

         Toute communication intra-cluster = mTLS STRICT (Istio)
         Communication user-service ↔ tutor-service via gRPC port 9090
```

### Pourquoi ces choix ?

- **Java/Spring Boot** sur les 2 services : alignement avec les exemples du référentiel pédagogique (`charroux/kubernetes-minikube`, `charroux/gRPCSpring`, `charroux/rentalservice`).
- **gRPC pour `tutor-service`** : justifié par le matching où le serveur peut streamer plusieurs résultats classés (server-streaming RPC). Le bonus du barème est ainsi techniquement motivé, pas plaqué.
- **PostgreSQL en StatefulSet** plutôt qu'externe (RDS, Cloud SQL) : démontre la maîtrise des `volumeClaimTemplates`, `headless Service`, `pg_isready` probes — autant de patterns K8s purs.
- **Istio plutôt qu'Ingress NGINX** : Istio Gateway suffit déjà à valider le palier 12/20, mais il débloque ensuite **gratuitement** mTLS + AuthorizationPolicy (palier 18/20). Le surcoût d'apprentissage est largement remboursé.

---

## 3. Stack technique détaillé

| Couche | Choix | Version |
|---|---|---|
| Langage backend | Java | 21 (Temurin / Zulu) |
| Framework | Spring Boot | 3.5.0 |
| Build | Maven Wrapper | 3.9.x |
| Auth | JWT HS256 (jjwt) | 0.12.6 |
| Mot de passe | BCrypt | Spring Security |
| Base de données | PostgreSQL | 16 alpine |
| gRPC | grpc-java + protoc | 1.66.0 |
| gRPC server | net.devh starter | 3.1.0 |
| Conteneurisation | Docker (multi-stage) | 29.x |
| Orchestration | Kubernetes / Minikube | 1.35 / 1.38 |
| Service mesh | Istio | 1.24.2 (profil demo) |
| Registry | Docker Hub | `lionlgr/edumatch-*:0.1.0` |

---

## 4. Paliers du barème — preuves d'avancement

### Palier 10/20 — service local + Docker + K8s

- `user-service` Spring Boot avec endpoints REST `/auth/register`, `/auth/login`, `/users/me`, `/users/{id}`, `/users`.
- JWT HS256 signé par une clé partagée entre services.
- Mot de passe haché en BCrypt avant insertion en base.
- `Dockerfile` multi-stage (build sur JDK, runtime sur JRE alpine, utilisateur non-root, healthcheck).
- Image publiée : [docker.io/lionlgr/edumatch-user-service:0.1.0](https://hub.docker.com/r/lionlgr/edumatch-user-service).
- Déploiement K8s : Namespace, ServiceAccount, ConfigMap, Secret, Deployment 2 réplicas, Service ClusterIP.

> **Capture à inclure** : `kubectl -n edumatch get pods,svc` montrant `user-service` et `user-postgres` en `Running`.

### Palier 12/20 — Gateway locale

- D'abord Ingress NGINX (palier intermédiaire), puis remplacé par **Istio Gateway + VirtualService** quand on a installé Istio pour le palier 18.
- Routage `/api/auth/*`, `/api/users/*`, `/api/tutors/*` avec réécriture du préfixe `/api`.
- Test : `curl http://edumatch.local/api/auth/register` → `201 Created` + JWT.

> **Capture à inclure** : sortie complète du `curl -i` retournant `HTTP/1.1 201` et le JSON `accessToken`.

### Palier 14/20 — 2e service + bonus gRPC

- `tutor-service` Spring Boot avec :
  - REST : `GET /tutors`, `GET /tutors/{id}`, `GET /tutors?subject=X`, `POST /tutors` (rôle TUTOR requis).
  - **gRPC** sur port 9090 : `TutorMatcher.MatchTutors(MatchRequest) returns (stream TutorMatch)`.
- Fichier `tutor.proto` partagé, code Java généré automatiquement par `protobuf-maven-plugin`.
- Algorithme : similarité cosinus binaire sur les ensembles de sujets — `|A ∩ B| / sqrt(|A| · |B|)`.
- Image : [docker.io/lionlgr/edumatch-tutor-service:0.1.0](https://hub.docker.com/r/lionlgr/edumatch-tutor-service).

> **Capture à inclure** : appel `grpcurl` retournant les tuteurs classés (Marie Dubois score 0.816, Jean Martin score 0.408).

### Palier 16/20 — base de données dans le cluster

- 2 `StatefulSet` PostgreSQL séparés (`user-postgres`, `tutor-postgres`) avec :
  - `volumeClaimTemplates` (PVC dynamique 1 Gi par instance)
  - `headless Service` pour la résolution DNS stable
  - probes `pg_isready` (readiness + liveness)
- Identifiants stockés en `Secret`, montés en variables d'env via `envFrom`.

> **Capture à inclure** : `kubectl -n edumatch get pvc` montrant les volumes liés.

### Palier 18/20 — sécurité (mTLS + RBAC)

- **Istio installé** avec le profil `demo`, namespace `edumatch` labellisé `istio-injection=enabled` → chaque pod reçoit un sidecar Envoy.
- **`PeerAuthentication: STRICT`** au niveau du namespace → toute communication non chiffrée est rejetée.
- **`AuthorizationPolicy default-deny`** + 5 règles d'autorisation explicites :
  - `istio-ingressgateway` → `user-service` REST
  - `istio-ingressgateway` → `tutor-service` REST
  - `user-service` SA → `tutor-service` port 9090 (gRPC east-west)
  - `user-service` SA → `user-postgres`
  - `tutor-service` SA → `tutor-postgres`
- **K8s RBAC** : `Role` + `RoleBinding` par ServiceAccount, restreignant l'accès aux ConfigMap/Secret du service correspondant uniquement.

**Preuves de l'enforcement** (testées dans le cluster) :

| Test | Attendu | Obtenu |
|---|---|---|
| `GET /api/tutors` via Istio Gateway | 200 + JSON 4 tuteurs | ✅ 200 |
| Pod sans sidecar → user-service | refus de connexion (mTLS bloque) | ✅ HTTP 000 |
| Pod ServiceAccount `default` → user-service | rejeté par AuthorizationPolicy | ✅ 403 "RBAC: access denied" |

> **Captures à inclure** : les 3 tests ci-dessus.

### Palier 20/20 — déploiement cloud (préparé, non activé)

- gcloud CLI authentifié sur `gableulmi@gmail.com`
- Projet GCP `edumatch-miage-2026` créé, billing activé via crédit Free Tier (300 €)
- APIs `container.googleapis.com` et `compute.googleapis.com` activées
- Commande pour activer le palier 20/20 :
  ```bash
  gcloud container clusters create-auto edumatch \
    --project=edumatch-miage-2026 \
    --region=europe-west1 \
    --release-channel=regular
  gcloud container clusters get-credentials edumatch --region=europe-west1
  istioctl install --set profile=demo -y
  kubectl apply -k k8s/base/user-service
  kubectl apply -k k8s/base/tutor-service
  kubectl apply -k k8s/base/istio
  ```
- Coût estimé : ~0.15 €/h ; ressources nécessaires couvertes par le crédit Free Tier.

> **Le cluster n'a pas été lancé pour préserver le crédit pendant la phase de développement.** Il peut être activé en 5-7 minutes le jour de la démonstration.

---

## 5. Critères d'évaluation — auto-positionnement

D'après le sujet, par ordre décroissant d'importance :

### 5.1 Intégration complète d'un maximum de technologies

| Techno | Intégrée ? | Où |
|---|---|---|
| Web Services REST | ✅ | user-service, tutor-service |
| Web Services **gRPC** | ✅ | tutor-service port 9090 |
| Docker | ✅ | 2 images multi-stage non-root |
| Kubernetes | ✅ | Minikube + manifestes prêts GKE |
| Gateway | ✅ | Istio Gateway + VirtualService |
| Service Mesh | ✅ | Istio 1.24 |
| Base de données | ✅ | 2× PostgreSQL StatefulSet |
| **mTLS** | ✅ | PeerAuthentication STRICT |
| **RBAC** | ✅ | K8s Role + Istio AuthorizationPolicy |
| HTTPS / Cloud | 🟡 | préparé, non activé |

### 5.2 Codage

Le code est volontairement **idiomatique** des bonnes pratiques Spring Boot 3 :
- Records Java pour les DTO (`RegisterRequest`, `LoginRequest`, `TutorResponse`...)
- `JpaRepository` Spring Data avec `@Query` pour la recherche par sujet
- `ConfigurationProperties` typé pour `app.jwt.*`
- Pas d'`@Autowired` field-injection — constructeurs partout
- Gestion d'erreurs via `ResponseStatusException` (404, 409, 401)
- `securityContext` durci dans les Deployments (read-only rootfs, non-root, drop ALL caps)
- Probes liveness/readiness pointées vers Spring Boot Actuator

### 5.3 Fonctionnalités

- Inscription + connexion avec JWT (1h de validité)
- Profils étudiants vs tuteurs (RBAC applicatif : seul un compte TUTOR peut créer un profil tuteur)
- Recherche de tuteur par matière
- **Matching par similarité cosinus** classant les tuteurs par pertinence (gRPC streaming)

### 5.4 Présentation (front office)

Le front-end React est listé comme **option** dans le sujet — non livré dans cette version pour respecter l'échéance. La présentation passe par :
- Swagger UI exposé sur `/swagger-ui.html` (sur `user-service`)
- Sortie JSON formatée + tests CLI documentés dans le README

---

## 6. Reproduction (mode opératoire)

Voir le [README.md](../README.md) à la racine du dépôt pour la commande complète, mais en résumé :

```bash
# 1. Démarrer Minikube avec 7 Go RAM minimum
minikube start --cpus=4 --memory=7000 --driver=docker

# 2. Installer Istio
istioctl install --set profile=demo -y

# 3. Déployer EduMatch
kubectl apply -k k8s/base/user-service
kubectl apply -k k8s/base/tutor-service
kubectl apply -k k8s/base/istio

# 4. Exposer (Minikube)
sudo minikube tunnel  # garder ce terminal ouvert
echo "127.0.0.1 edumatch.local" | sudo tee -a /etc/hosts

# 5. Tester
curl http://edumatch.local/api/tutors
curl -X POST http://edumatch.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"toi@miage.fr","password":"superSecret1","fullName":"Toi","role":"STUDENT"}'
```

---

## 7. Difficultés rencontrées + solutions

| Problème | Cause | Solution |
|---|---|---|
| 403 sur duplicate register au lieu de 409 | Spring Security 6 fait passer le forward `/error` par la filter chain | `dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()` |
| Ingress NGINX retournait réponse vide | Pas de réécriture du préfixe `/api` | Annotation `nginx.ingress.kubernetes.io/rewrite-target: /$1` + regex |
| `ClassNotFoundException: io.grpc.InternalConfiguratorRegistry` au runtime | Versions grpc-core/grpc-api incohérentes via la transitivité | Import du `grpc-bom` dans `dependencyManagement` |
| `protoc-maven-plugin` échouait dans le Dockerfile | Binaire protoc lié à glibc, image alpine = musl libc | Build stage `eclipse-temurin:21-jdk-jammy` (Debian) |
| `cannot find symbol: class Generated` | `javax.annotation.Generated` retiré depuis JDK 11 | Ajout dépendance `javax.annotation:javax.annotation-api:1.3.2` |
| Cluster Minikube saturé après install Istio | 4 Go alloués trop juste | `minikube delete && minikube start --memory=7000` |
| HTTP 000 au premier appel via Istio | Race condition : curl démarre avant sidecar Envoy prêt | `sleep 8` avant curl, ou `holdApplicationUntilProxyStarts: true` |

---

## 8. Google Labs

Voir [SCREENSHOTS.md](SCREENSHOTS.md) pour la liste des captures à fournir.

Labs ciblés (5 labs minimum recommandés) :
- Kubernetes in Google Cloud: Challenge Lab
- Deploy a Microservices Application with Anthos Service Mesh
- Securing a GKE cluster with Network Policies
- Cloud IAM: Qwik Start
- GKE Workload Identity

---

## 9. Code source

Dépôt : _[à compléter avec l'URL GitHub/GitLab]_

Structure :
```
edumatch/
├── services/
│   ├── user-service/       Spring Boot REST + JWT
│   └── tutor-service/      Spring Boot REST + gRPC
├── k8s/base/
│   ├── user-service/       Namespace, Deployment, Service, Secret, StatefulSet PG
│   ├── tutor-service/      idem
│   └── istio/              Gateway, VirtualService, PeerAuth, AuthZ, RBAC
├── docs/
│   ├── RAPPORT.md          (ce document)
│   └── SCREENSHOTS.md      liste des captures à fournir
└── README.md               quick-start
```

5 commits sur la branche `main`, un par palier :
1. `feat: bootstrap user-service (palier 10/20)`
2. `chore: point Deployment to lionlgr/edumatch-user-service:0.1.0 on Docker Hub`
3. `fix(ingress): strip /api prefix via rewrite-target`
4. `feat: add tutor-service with gRPC + REST (palier 14/20)`
5. `feat(istio): mTLS STRICT + AuthorizationPolicy + RBAC (palier 18/20)`

---

## 10. Conclusion

L'objectif fixé — **valider le palier 18/20 sur 20 jours en binôme** — est atteint.

Le palier 20/20 (cloud) est techniquement **à 5 minutes** : toute l'infrastructure GCP est en place, il suffit de lancer la commande `gcloud container clusters create-auto edumatch`. Le choix de ne pas activer le cluster pendant la phase de développement est purement budgétaire (préservation du crédit Free Tier).

Le projet démontre une **intégration cohérente de l'écosystème Cloud Native** : on ne se contente pas de cocher les cases, chaque technologie résout un problème métier ou de sécurité explicitement décrit dans ce document.
