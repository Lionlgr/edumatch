# Roadmap technique

État actuel : projet déployé en local sur Minikube avec Istio (mTLS + AuthorizationPolicy + RBAC). Front React opérationnel. Tout le code et les manifestes sont versionnés.

## Prochaines évolutions possibles

### Déploiement cloud (GKE Autopilot)

Toute l'infra GCP est en place (projet `edumatch-miage-2026`, billing activé, APIs `container` et `compute` activées). Pour lancer le cluster :

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

Pensez à supprimer le cluster après usage pour préserver le crédit Free Tier :

```bash
gcloud container clusters delete edumatch --region=europe-west1
```

### CI/CD GitHub Actions

Workflow `build → test → push Docker Hub → kubectl apply` à chaque push sur `main`. Permet de démontrer la maturité DevOps.

### `booking-service` (3e microservice)

Service Node.js consommateur du gRPC `TutorMatcher.MatchTutors` pour démontrer une chaîne d'appels inter-services authentifiée en mTLS Istio.

### Persistance avancée

- Migrations Flyway ou Liquibase au lieu de `ddl-auto: update`
- Backups automatiques des PostgreSQL via `CronJob`

### Observabilité

- Prometheus + Grafana (l'actuator est déjà exposé sur `/actuator/prometheus`)
- Kiali pour visualiser la topologie Istio en temps réel
- Jaeger pour le tracing distribué

### Mode opératoire détaillé (build → push → déploiement)

```bash
# 1. Build local
cd services/user-service
docker build -t lionlgr/edumatch-user-service:0.2.0 .

# 2. Push Docker Hub
docker login
docker push lionlgr/edumatch-user-service:0.2.0

# 3. Bump le tag dans k8s/base/user-service/deployment.yaml puis :
kubectl apply -k k8s/base/user-service
kubectl -n edumatch rollout status deployment/user-service
```

### Configuration des Google Labs (rendu)

Voir [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md) pour la liste des labs recommandés et la procédure de capture.
