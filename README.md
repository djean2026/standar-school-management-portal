# Portail scolaire — Frontend

Interface React (français) pour la plateforme de gestion scolaire MVP.

**Ce dépôt GitHub = frontend uniquement** (`standar-school-management-portal`). Le backend vit dans un **deuxième dossier local** au même niveau : `standar-school-management-portal-be` (pas poussé sur ce remote).

## Prérequis

- Node.js 20+
- Backend démarré sur le port configuré (par défaut `8080`)

## Configuration

Copiez `.env.example` vers `.env.local` si besoin :

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | URL du backend, sans slash final (ex. `http://localhost:8080`) |

En développement, `frontend/.env.development` pointe déjà vers `http://localhost:8080`.

## Lancer le frontend seul

```bash
cd frontend
npm install
npm run dev
```

Application : [http://localhost:5173](http://localhost:5173)

## Backend (projet séparé)

```bash
cd ../standar-school-management-portal-be
docker compose up -d
cd backend && ./mvnw spring-boot:run
```

Comptes démo et détails API : voir le README du backend.
