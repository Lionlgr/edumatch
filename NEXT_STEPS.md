# Prochaines étapes — Palier 10 → 20/20

État actuel : **palier 10/20 atteint** (1 service codé + Dockerfile + manifestes K8s prêts).
Reste à exécuter : build Docker, push Docker Hub, déploiement Minikube, puis paliers 12 → 20.

## 1. Build & push de l'image Docker (palier 10/20 — finalisation)

```bash
# Lancer Docker Desktop d'abord (icône baleine)
docker info  # doit répondre sans erreur

cd services/user-service

# Build l'image
docker build -t edumatch-user-service:0.1.0 .

# Test rapide (utilise H2 par défaut via profil dev — override SPRING_PROFILES_ACTIVE pour la démo)
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev edumatch-user-service:0.1.0
# Dans un autre terminal :
curl http://localhost:8080/actuator/health

# Login Docker Hub (créer un compte si nécessaire — https://hub.docker.com)
docker login

# Tag + push (remplacer YOUR_DOCKERHUB_USER)
docker tag edumatch-user-service:0.1.0 YOUR_DOCKERHUB_USER/edumatch-user-service:0.1.0
docker push YOUR_DOCKERHUB_USER/edumatch-user-service:0.1.0

# Mettre à jour k8s/base/user-service/deployment.yaml :
#   image: docker.io/YOUR_DOCKERHUB_USER/edumatch-user-service:0.1.0
```

## 2. Déploiement Minikube (palier 10/20 confirmé)

```bash
# Démarrer Minikube avec Ingress activé
minikube start --cpus=4 --memory=4096 --driver=docker
minikube addons enable ingress

# Déployer
kubectl apply -k k8s/base/user-service

# Vérifier
kubectl -n edumatch get pods,svc,ingress
kubectl -n edumatch logs deploy/user-service --tail=50

# Tester via port-forward (rapide)
kubectl -n edumatch port-forward svc/user-service 8080:80
curl http://localhost:8080/actuator/health
```

## 3. Gateway locale (palier 12/20)

```bash
# Ajouter une entrée /etc/hosts pour edumatch.local
echo "$(minikube ip) edumatch.local" | sudo tee -a /etc/hosts

# Vérifier l'Ingress
curl http://edumatch.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@miage.fr","password":"superSecret1"}'
```

## 4. À coder ensuite

### Palier 14/20 — `tutor-service` (Java + gRPC) et `booking-service` (Node.js)
- Proto partagé dans `/proto/edumatch.proto` (User, Tutor, Booking)
- `tutor-service` expose un endpoint gRPC `MatchTutors(Query)` + REST `/tutors`
- `booking-service` Node.js Express : `POST /bookings`, `GET /bookings/{userId}`
- Communication inter-services authentifiée via JWT (chaque service valide la même clé HMAC)

### Palier 16/20 — Persistance K8s
- StatefulSet PostgreSQL par service (déjà câblé pour user-service)
- Migrations Flyway/Liquibase à ajouter (au lieu de `ddl-auto: update`)

### Palier 18/20 — Istio + mTLS + RBAC
- Installer Istio : `istioctl install --set profile=demo -y`
- Remplacer `ingress.yaml` par Istio `Gateway` + `VirtualService`
- Activer `PeerAuthentication` STRICT au niveau du namespace
- Créer des `AuthorizationPolicy` (par exemple : seul `booking-service` peut appeler `tutor-service`)
- RBAC K8s : `Role` + `RoleBinding` limitant la SA de chaque service à ses propres ConfigMaps/Secrets

### Palier 20/20 — Déploiement GKE Autopilot
- `gcloud auth login` + créer un projet GCP (utiliser les 300 $ gratuits)
- `gcloud container clusters create-auto edumatch --region=europe-west1`
- Installer Istio sur GKE (ou utiliser Anthos Service Mesh)
- Configurer Cloud DNS + cert-manager pour HTTPS
- CI/CD GitHub Actions : build → push GCR → `kubectl apply`

## 5. Captures Google Labs (pour le rapport)

À faire pendant le projet :
- [https://www.cloudskillsboost.google/](https://www.cloudskillsboost.google/) → suivre 5 labs :
  1. **Kubernetes in Google Cloud: Challenge Lab**
  2. **Deploy a Microservices Application with Anthos Service Mesh**
  3. **Securing a GKE cluster with Network Policies**
  4. **Cloud IAM: Qwik Start**
  5. **GKE Workload Identity**
- Chaque lab donne un badge + une activité visible sur le profil → captures à inclure dans le rapport.
