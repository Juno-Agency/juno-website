# JUNO

Site vitrine + formulaire d'intake pour **JUNO**, agence web qui livre des sites
clé en main via un pipeline assisté par IA. Monorepo : front Angular, API Node,
base PostgreSQL, le tout conteneurisé.

## Stack

| Couche   | Techno                                                |
| -------- | ----------------------------------------------------- |
| Frontend | Angular 21 (standalone, zoneless, SCSS, animations)   |
| Backend  | Express + TypeScript                                  |
| BDD      | PostgreSQL via Prisma (ORM)                           |
| API docs | Swagger UI généré depuis des schémas Zod              |
| Infra    | Docker + docker-compose (front nginx, API, db, Adminer) |

## Arborescence

```
juno/
├── frontend/            # Application Angular 21
│   ├── src/app/
│   │   ├── core/        # JunoLeadService, helper reduced-motion
│   │   ├── shared/      # directives (reveal, autofocus), overlays fx
│   │   └── pages/
│   │       ├── landing/ # nav, hero-chat, marquee, méthode, garanties, cta
│   │       └── intake/  # formulaire immersif (modèle, données, moteur)
│   ├── nginx.conf       # sert le build + proxy /api → backend
│   └── Dockerfile
├── backend/             # API Express + Prisma
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── leads/       # schémas Zod + routes des demandes
│   │   ├── auth/        # JWT + login back-office
│   │   ├── openapi/     # registry + génération du document OpenAPI
│   │   └── middleware/  # validation, erreurs
│   └── Dockerfile
├── site/                # maquettes HTML de référence (source de vérité)
└── docker-compose.yml
```

## Démarrage rapide (Docker)

```bash
cp .env.example .env          # ajustez les secrets
docker compose up --build
```

- Site public : http://localhost:8080 (la route `/admin` y est bloquée)
- Formulaire : http://localhost:8080/projet
- Back-office : http://localhost:8090/admin (conteneur dédié `juno-backoffice`)
- API : http://localhost:3000/api
- Swagger : http://localhost:3000/api/docs
- Adminer (BDD) : http://localhost:8081 (système PostgreSQL, serveur `db`)

Le back-office tourne dans **son propre conteneur** (même build Angular, nginx
orienté admin). Il propose deux onglets : **Demandes** (CRUD complet) et
**Statistiques** (devis signés, taux de conversion/signature, évolution
hebdomadaire, répartitions par statut/type/secteur/budget).

La base est synchronisée automatiquement au démarrage (`prisma db push`) et un
utilisateur admin est créé si `RUN_SEED=true`.

## Développement local (sans Docker)

**Base de données** — MongoDB via compose :

```bash
docker compose up -d db
```

**Backend**

```bash
cd backend
cp .env.example .env   # renseigner DATABASE_URL, JWT_SECRET, ADMIN_*
npm install
npm run dev            # http://localhost:3000 (PORT dans .env)
npm test               # Vitest
```

Ni migration ni seed à lancer : Mongoose crée les collections à la volée, et
l'admin du back-office est authentifié depuis les variables d'environnement
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`), pas depuis la base.

**Frontend**

```bash
cd frontend
npm install
npm start            # http://localhost:4200 (proxy /api → :3000)
```

Si le port 3000 est déjà pris sur votre machine, changez `PORT` dans
`backend/.env` **et** la cible dans `frontend/proxy.conf.json` — les deux
doivent concorder.

### Travailler sur les données de production

```bash
cd frontend
npm run start:prod-api   # http://localhost:4200, /api → API Render
```

Le serveur de dev relaie alors `/api` vers la production (`proxy.conf.prod.mjs`)
au lieu du backend local : utile pour gérer le backlog de tickets partagé sans
lancer Mongo ni l'API. Trois choses à garder en tête :

- **les écritures sont réelles** — supprimer un ticket, un lead ou un projet du
  portfolio ici, c'est le supprimer pour de bon ;
- la connexion se fait avec les **identifiants admin de production** (dashboard
  Render), pas avec ceux du `.env` local ;
- l'API dort après 15 minutes sans trafic (plan gratuit) : le premier appel peut
  mettre une minute à répondre.

Le démarrage affiche un bandeau jaune « API DE PRODUCTION ». S'il n'est pas là,
c'est que vous tournez sur le backend local.

## API

| Méthode | Route                | Accès       | Rôle                              |
| ------- | -------------------- | ----------- | --------------------------------- |
| POST    | `/api/leads`         | public      | Réception du formulaire d'intake  |
| GET     | `/api/leads`         | JWT (admin) | Liste des demandes (back-office)  |
| GET     | `/api/leads/stats`   | JWT (admin) | Statistiques agrégées             |
| GET     | `/api/leads/:id`     | JWT (admin) | Détail d'une demande              |
| PATCH   | `/api/leads/:id`     | JWT (admin) | Modifier tout champ / le statut   |
| DELETE  | `/api/leads/:id`     | JWT (admin) | Supprimer une demande             |
| POST    | `/api/auth/login`    | public      | Authentification back-office      |
| GET     | `/api/health`        | public      | Supervision                       |

## Back-office (à venir)

Les fondations sont posées : table `AdminUser`, login JWT, endpoints `/api/leads`
protégés et statuts de demande (`NEW → CONTACTED → QUOTED → WON/LOST`). Il restera
à construire l'interface d'administration (Angular) qui consomme ces endpoints.
