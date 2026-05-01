# RoadSoS Architecture

## System Architecture Overview

RoadSoS is a full-stack monorepo with a React + Vite client and an Express + SQLite backend.

- Frontend requests nearby services and contact management APIs.
- Backend aggregates emergency services from:
  - OpenStreetMap Overpass API (live data)
  - SQLite (`better-sqlite3`) curated emergency contacts
  - Offline JSON fallback dataset
- Ranking and distance scoring happen server-side for consistent triage behavior.
- Client renders ranked cards, Leaflet maps, and emergency actions (call/share/navigate).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | SQLite with `better-sqlite3` |
| Maps | Leaflet, React-Leaflet, OpenStreetMap tiles |
| Offline / PWA | Service Worker, Web App Manifest, offline JSON fallback |

## API Endpoints

| Method | Path | Params | Response |
|---|---|---|---|
| GET | `/api/health` | None | Service status message |
| GET | `/api/services/nearby` | `lat`, `lng`, `type`, `radius` | Ranked nearby services array |
| GET | `/api/contacts` | None | All contacts (admin list) |
| GET | `/api/contacts/:id` | `id` | Single contact |
| POST | `/api/contacts` | Contact payload | Created contact |
| PUT | `/api/contacts/:id` | `id`, contact payload | Updated contact |
| DELETE | `/api/contacts/:id` | `id` | `{ deleted: true }` |

## Folder Structure

```text
RoadSoS/
├─ client/
│  ├─ public/
│  │  ├─ manifest.json
│  │  └─ service-worker.js
│  └─ src/
│     ├─ api/
│     ├─ components/
│     ├─ data/
│     ├─ hooks/
│     ├─ pages/
│     └─ utils/
├─ server/
│  └─ src/
│     ├─ data/
│     ├─ db/
│     ├─ routes/
│     └─ utils/
└─ docs/
   ├─ architecture.md
   └─ workflow.md
```

## Offline Strategy (3 Layers)

1. **PWA Cache Layer**
   - Service worker caches app shell and core requests.
   - Nearby API uses network-first with cache fallback for last known result.

2. **Backend Data Layer**
   - Primary source: OSM live fetch.
   - Secondary source: SQLite emergency contacts.
   - If both fail: backend uses `server/src/data/offlineContacts.json`.

3. **Frontend Emergency Layer**
   - If Emergency page receives no online services, it loads `client/src/data/offlineContacts.json` and surfaces an alert to the user.
