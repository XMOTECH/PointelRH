# PointelRH — Guide de Deploiement Production

## 1. Variables GitLab CI/CD

Configurer dans **GitLab > Settings > CI/CD > Variables** :

| Variable | Masked | Protected | Description |
|----------|--------|-----------|-------------|
| `SSH_PRIVATE_KEY` | Oui | Oui | Cle SSH privee pour le serveur |
| `SSH_KNOWN_HOSTS` | Non | Non | Resultat de `ssh-keyscan <IP-serveur>` |
| `SSH_USER` | Non | Oui | Utilisateur SSH (ex: `deploy`) |
| `SSH_HOST` | Non | Oui | IP ou hostname du serveur |
| `PRODUCTION_URL` | Non | Non | URL publique (ex: `https://app.pointel.rh`) |
| `VITE_API_URL` | Non | Non | Vide `""` — le proxy nginx gere |
| `VITE_GOOGLE_CLIENT_ID` | Non | Non | Client ID Google OAuth |

> Les credentials DB/RabbitMQ/JWT restent dans `/opt/pointel-rh/.env` sur le serveur (pas dans GitLab CI).

## 2. Preparation du serveur

### Prerequis
- Docker Engine 24+
- Docker Compose v2
- Utilisateur `deploy` avec acces Docker (`sudo usermod -aG docker deploy`)

### Structure du repertoire

```
/opt/pointel-rh/
  .env                     # Variables de production (copie de .env.production.example)
  docker-compose.yml       # Copie par le CI depuis docker-compose.prod.yml
  kong/
    kong.yml               # Copie par le CI
```

### Premiere installation

```bash
# 1. Creer le repertoire
sudo mkdir -p /opt/pointel-rh/kong
sudo chown -R deploy:deploy /opt/pointel-rh

# 2. Copier et remplir le fichier .env
# Depuis votre machine locale :
scp .env.production.example deploy@<SERVER>:/opt/pointel-rh/.env

# Sur le serveur, editer les valeurs :
ssh deploy@<SERVER>
nano /opt/pointel-rh/.env

# 3. Generer les APP_KEY (sur le serveur ou en local)
# Pour chaque service, generer une cle :
php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
# Copier la valeur dans le .env pour AUTH_APP_KEY, EMPLOYEE_APP_KEY, etc.

# 4. Generer le JWT_SECRET
openssl rand -base64 64
# Copier dans JWT_SECRET du .env

# 5. Generer les mots de passe DB et RabbitMQ
openssl rand -base64 32
# Copier pour chaque *_DB_PASSWORD, *_DB_ROOT_PASSWORD, RABBITMQ_PASSWORD

# 6. Le premier deploy via GitLab CI copiera les fichiers manquants
# Lancer le pipeline manuellement depuis GitLab
```

## 3. Deploiement

Le deploiement est **manuel** (bouton play dans GitLab CI).

### Ce que fait le pipeline automatiquement :
1. **SCP** `docker-compose.prod.yml` → `/opt/pointel-rh/docker-compose.yml`
2. **SCP** `kong/kong.yml` → `/opt/pointel-rh/kong/kong.yml`
3. **docker compose pull** — telecharge les nouvelles images
4. **docker compose up -d** — redemarre les services mis a jour
5. **php artisan migrate --force** — execute les migrations sur chaque service
6. **php artisan config:cache** — cache la config Laravel
7. **docker image prune** — nettoie les images inutilisees

### Deploiement manuel (sans CI)

```bash
cd /opt/pointel-rh
docker login registry.gitlab.com
docker compose pull
docker compose up -d --remove-orphans

# Migrations
for svc in auth-service employee-service pointage-service notif-service analytics-service; do
  docker compose exec -T $svc php artisan migrate --force
  docker compose exec -T $svc php artisan config:cache
done

docker image prune -f
```

## 4. Monitoring

### Verifier la sante des services
```bash
# Tous les services
docker compose ps

# Health check individuel
curl http://localhost:8000/api/health         # via Kong (ne marchera que si route Kong configuree)
docker compose exec auth-service curl -s http://localhost/api/health
docker compose exec employee-service curl -s http://localhost/api/health
```

### Logs
```bash
# Tous les services
docker compose logs -f

# Service specifique
docker compose logs -f auth-service

# Derniers logs
docker compose logs --tail=100 auth-service
```

## 5. Rollback

```bash
cd /opt/pointel-rh

# Revenir a un tag specifique
# Editer TAG dans .env (ex: TAG=abc1234)
nano .env

docker compose pull
docker compose up -d --remove-orphans
```

## 6. Architecture reseau (production)

```
Internet
  |
  v
[Frontend :80] ─── SPA React
  |
  v (proxy /api/* vers :8000)
[Kong :8000] ─── API Gateway
  |
  ├── auth-service :80
  ├── employee-service :80
  ├── pointage-service :80
  ├── notif-service :80
  └── analytics-service :80
```

- **Kong admin** (`8001`) est limite a `127.0.0.1` — pas accessible depuis l'exterieur
- **RabbitMQ management** (`15672`) n'est pas expose en production
- Les bases de donnees ne sont pas exposees — accessibles uniquement via le reseau Docker interne
