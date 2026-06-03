# EduMatch — Marketplace de tutorat universitaire

Projet académique **Master MIAGE GR2** — démonstration d'une architecture Cloud Native complète sur Kubernetes avec service mesh, mTLS et RBAC.

[![Java](https://img.shields.io/badge/Java-21-orange)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen)]()
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.35-blue)]()
[![Istio](https://img.shields.io/badge/Istio-1.24-466bb0)]()
[![gRPC](https://img.shields.io/badge/gRPC-bonus-success)]()

> 📄 **[Rapport complet → docs/RAPPORT.md](docs/RAPPORT.md)**

---

## Fonctionnalités livrées

| Module | État |
|---|---|
| Microservices Java/Spring Boot conteneurisés | ✅ |
| Déploiement Kubernetes (Minikube + GKE-ready) | ✅ |
| Gateway de bord (Istio) avec réécriture de chemins | ✅ |
| Communication gRPC bidirectionnelle entre services | ✅ |
| PostgreSQL en StatefulSet (1 base par service) | ✅ |
| Sécurité mTLS STRICT + AuthorizationPolicy + RBAC K8s | ✅ |
| Front-end React + Tailwind avec auth JWT | ✅ |
| Déploiement cloud GKE Autopilot | 🟡 préparé (gcloud + projet GCP), cluster non lancé |

---

## Architecture

```
                          ┌─────────────────────────┐
                          │   curl / navigateur     │
                          │ (Host: edumatch.local)  │
                          └────────────┬────────────┘
                                       │ HTTP/1.1
                                       ▼
                          ┌─────────────────────────┐
                          │  Istio Ingress Gateway  │
                          └────────────┬────────────┘
                                       │ HTTP/2 + mTLS
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌──────────────────┐   ┌──────────────────┐    ┌──────────────────┐
    │   user-service   │   │   user-service   │    │  tutor-service   │
    │ (Spring Boot +   │   │ (Spring Boot +   │    │ (Spring Boot +   │
    │  Envoy sidecar)  │   │  Envoy sidecar)  │    │  Envoy sidecar)  │
    │  REST 8080       │   │  REST 8080       │    │  REST 8080       │
    │                  │   │                  │    │  gRPC 9090       │
    └────────┬─────────┘   └────────┬─────────┘    └────────┬─────────┘
             │                      │                       │
             ▼                      ▼                       ▼
        ┌──────────────────┐                ┌──────────────────┐
        │   user-postgres  │                │  tutor-postgres  │
        │   (StatefulSet)  │                │   (StatefulSet)  │
        └──────────────────┘                └──────────────────┘

         Toute communication intra-cluster = mTLS STRICT (Istio)
```

[Diagramme Mermaid haute résolution → docs/architecture.mmd](docs/architecture.mmd)

---

## Services

| Service | Stack | Port | Communication | Rôle |
|---|---|---|---|---|
| [user-service](services/user-service) | Java 21 / Spring Boot 3.5 | 8080 | REST | Auth JWT, profils étudiant/tuteur |
| [tutor-service](services/tutor-service) | Java 21 / Spring Boot 3.5 | 8080 + 9090 | REST + **gRPC** | Annonces, matching par compétences (cosinus) |

Images Docker Hub :
- [lionlgr/edumatch-user-service:0.1.0](https://hub.docker.com/r/lionlgr/edumatch-user-service)
- [lionlgr/edumatch-tutor-service:0.1.0](https://hub.docker.com/r/lionlgr/edumatch-tutor-service)

---

## Démarrage rapide

### Pré-requis

- Docker Desktop avec **au moins 8 Go RAM** alloués
- Minikube ≥ 1.35
- kubectl ≥ 1.30
- Istio CLI 1.24 (`brew install istioctl` ou voir [docs/RAPPORT.md](docs/RAPPORT.md#6-reproduction-mode-opératoire))

### Déploiement local

```bash
# 1. Cluster Kubernetes + service mesh
minikube start --cpus=4 --memory=7000 --driver=docker
istioctl install --set profile=demo -y

# 2. Déployer EduMatch
kubectl apply -k k8s/base/user-service
kubectl apply -k k8s/base/tutor-service
kubectl apply -k k8s/base/istio

# 3. Attendre que tout soit Ready (~2 min)
kubectl -n edumatch get pods -w

# 4. Exposer Istio Gateway (laisser tourner)
sudo minikube tunnel
```

Dans un autre terminal :

```bash
# Une fois pour toutes : résolution DNS
echo "127.0.0.1 edumatch.local" | sudo tee -a /etc/hosts

# Tester l'API
curl http://edumatch.local/api/tutors

curl -X POST http://edumatch.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"toi@miage.fr","password":"superSecret1","fullName":"Toi","role":"STUDENT"}'
```

### Tester le gRPC

```bash
brew install grpcurl  # une fois

kubectl -n edumatch port-forward svc/tutor-service 9090:9090 &
grpcurl -plaintext localhost:9090 list
grpcurl -plaintext -d '{"subjects":["math","algebra"],"limit":3}' \
  localhost:9090 fr.miage.edumatch.tutor.grpc.TutorMatcher/MatchTutors
```

### Vérifier que mTLS bloque les accès non autorisés

```bash
# Test : pod sans sidecar Envoy doit être bloqué
kubectl run -n default no-sidecar --rm -i --restart=Never \
  --image=curlimages/curl:latest -- \
  sh -c "sleep 5 && curl -s -o - -w 'HTTP %{http_code}\n' --max-time 10 \
    http://user-service.edumatch.svc.cluster.local/users"
# → HTTP 000 (mTLS STRICT rejette la connexion)
```

---

## Déploiement cloud (GKE Autopilot)

Le projet GCP `edumatch-miage-2026` est prêt. Pour activer le déploiement :

```bash
gcloud auth login
gcloud config set project edumatch-miage-2026

gcloud container clusters create-auto edumatch \
  --region=europe-west1 \
  --release-channel=regular

gcloud container clusters get-credentials edumatch --region=europe-west1
istioctl install --set profile=demo -y
kubectl apply -k k8s/base/user-service
kubectl apply -k k8s/base/tutor-service
kubectl apply -k k8s/base/istio
```

**Pensez à supprimer le cluster** quand la démo est terminée :
```bash
gcloud container clusters delete edumatch --region=europe-west1
```

---

## Structure du dépôt

```
.
├── README.md                       quick-start (ce fichier)
├── docs/
│   ├── RAPPORT.md                  rapport complet pour le correcteur
│   ├── SCREENSHOTS.md              liste des captures à fournir
│   └── architecture.mmd            diagramme Mermaid
├── services/
│   ├── user-service/               Spring Boot REST + JWT + PostgreSQL
│   └── tutor-service/              Spring Boot REST + gRPC + PostgreSQL
└── k8s/base/
    ├── user-service/               Namespace, SA, ConfigMap, Secret,
    │                               StatefulSet PG, Deployment, Service
    ├── tutor-service/              idem
    └── istio/                      Gateway, VirtualService,
                                    PeerAuthentication STRICT,
                                    AuthorizationPolicy, RBAC K8s
```

---
