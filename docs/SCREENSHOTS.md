# Captures d'écran à fournir avec le rapport

Le sujet exige :
1. **Captures d'écran de l'application** pour que le correcteur comprenne le rendu
2. **Captures d'écran individuelles** du profil Google Labs de chaque membre du binôme

Voici la liste exhaustive. Stockez les fichiers PNG dans `docs/img/` puis référencez-les dans le rapport.

---

## 1. Captures de l'application

### 1.1 Cluster Minikube

| # | Commande / écran | Nom du fichier |
|---|---|---|
| 1 | `kubectl -n edumatch get pods,svc` (tout en 2/2 Running, sidecars Istio injectés) | `01-cluster-pods.png` |
| 2 | `kubectl -n edumatch get pvc` (volumes PostgreSQL persistants) | `02-pvc.png` |
| 3 | `kubectl -n istio-system get pods` (istiod + ingressgateway healthy) | `03-istio-system.png` |
| 4 | Sortie de `istioctl analyze -n edumatch` (idéalement 0 issue) | `04-istio-analyze.png` |

### 1.2 Docker Hub

| # | Écran | Nom du fichier |
|---|---|---|
| 5 | Page de votre repo Docker Hub avec les 2 images `edumatch-user-service:0.1.0` et `edumatch-tutor-service:0.1.0` | `05-dockerhub.png` |

### 1.3 Endpoints REST (via Istio Gateway)

Lancer `sudo minikube tunnel` puis exécuter les commandes ci-dessous dans Postman, Insomnia, ou simplement `curl -i` pour capturer la réponse HTTP avec ses headers.

| # | Endpoint | Nom du fichier |
|---|---|---|
| 6 | `POST /api/auth/register` → 201 + JWT | `06-register.png` |
| 7 | `POST /api/auth/login` → 200 + JWT | `07-login.png` |
| 8 | `GET /api/users/me` avec Bearer → 200 + profil | `08-me.png` |
| 9 | `GET /api/users/me` sans Bearer → 401 | `09-me-401.png` |
| 10 | `GET /api/tutors` → 200 + liste 4 tuteurs | `10-tutors.png` |
| 11 | `GET /api/tutors?subject=java` → 200 + 1 tuteur (Karim) | `11-tutors-filter.png` |

### 1.4 gRPC

| # | Commande | Nom du fichier |
|---|---|---|
| 12 | `grpcurl -plaintext localhost:9090 list` (services exposés) | `12-grpc-list.png` |
| 13 | `MatchTutors(["math","calculus"])` → Marie 0.816, Jean 0.408 (streaming) | `13-grpc-match.png` |

> Pour ouvrir le port gRPC depuis le laptop : `kubectl -n edumatch port-forward svc/tutor-service 9090:9090` dans un terminal séparé.

### 1.5 Sécurité (preuves d'enforcement)

| # | Test | Nom du fichier |
|---|---|---|
| 14 | Pod **sans sidecar** → user-service → connection refused | `14-mtls-block.png` |
| 15 | Pod avec sidecar mais **mauvaise ServiceAccount** → 403 RBAC | `15-authz-block.png` |
| 16 | `kubectl describe peerauthentication default -n edumatch` (mode STRICT) | `16-peerauth.png` |
| 17 | `kubectl get authorizationpolicy -n edumatch` (liste des règles) | `17-authzpolicies.png` |

### 1.6 Diagramme d'architecture

Le rapport inclut un schéma ASCII. Pour un rendu plus joli, exporter le diagramme Mermaid de `docs/architecture.mmd` en PNG via :

```bash
npx -y @mermaid-js/mermaid-cli -i docs/architecture.mmd -o docs/img/00-architecture.png
```

| # | Fichier |
|---|---|
| 0 | `00-architecture.png` |

---

## 2. Captures Google Labs (1 par membre du binôme)

Chaque membre doit suivre **au moins 5 labs Google Cloud Skills Boost** sur le thème Kubernetes / Istio / Sécurité.

### Comment capturer

1. Aller sur https://www.cloudskillsboost.google/profile/activity
2. Filtrer par "Labs" (pas les Quests)
3. Capture **complète** de la page (incluant nom, date, badge)

### Labs recommandés (chaque membre choisit son parcours, idéalement complémentaire)

| Lab | Difficulté | Durée | Score barème |
|---|---|---|---|
| Hello Node Kubernetes | 1h | Facile | Bases K8s |
| **Kubernetes Engine: Qwik Start** | 1h | Facile | GKE basics |
| **Manage Deployments Using Kubernetes Engine** | 1h | Moyen | Rolling updates |
| **Anthos Service Mesh: GKE** | 1h30 | Moyen | Istio sur GKE (très pertinent) |
| **Securing GKE Cluster with Network Policies** | 1h | Moyen | RBAC réseau |
| **Helm Charts on GKE** | 45min | Facile | Packaging K8s |
| **Cloud IAM: Qwik Start** | 30min | Facile | IAM bases |
| **GKE Workload Identity** | 1h30 | Avancé | Sécurité avancée |

### Conseils

- Lancer **2 labs en parallèle** (en attendant qu'un lab finisse de provisionner, démarrer le suivant)
- Capturer **immédiatement** la complétion (un lab disparaît parfois de l'historique 24h après)
- Les badges sont publics : votre lien profil peut être inclus dans le rapport

### Fichiers à nommer

| Membre | Nom du fichier |
|---|---|
| Membre 1 (Lionel) | `labs-lionel.png` |
| Membre 2 | `labs-binome.png` |

---

## 3. Récap final

À la fin, vous devriez avoir dans `docs/img/` :

```
00-architecture.png
01-cluster-pods.png
02-pvc.png
03-istio-system.png
04-istio-analyze.png
05-dockerhub.png
06-register.png
07-login.png
08-me.png
09-me-401.png
10-tutors.png
11-tutors-filter.png
12-grpc-list.png
13-grpc-match.png
14-mtls-block.png
15-authz-block.png
16-peerauth.png
17-authzpolicies.png
labs-lionel.png
labs-binome.png
```

Mettez à jour le rapport pour référencer chaque image au bon endroit :

```markdown
![Cluster pods](img/01-cluster-pods.png)
```
