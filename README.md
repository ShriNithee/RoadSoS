# RoadSoS Monorepo

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Overpass-7EBC6F?logo=openstreetmap&logoColor=white)](https://www.openstreetmap.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-dc2626)](https://web.dev/progressive-web-apps/)

Full-stack monorepo with:

- `client`: React + Vite + Tailwind CSS
- `server`: Node.js + Express + SQLite (`better-sqlite3`)

## Features

- SOS-first emergency experience with one-tap call and navigation
- Live location acquisition with geolocation permission handling
- Ranked nearby services with urgency + distance + trust scoring
- Interactive Leaflet map with user and service markers
- Admin dashboard with authentication and full contacts CRUD
- Offline-aware experience with banners, fallback data, and cache
- PWA support with installable manifest + service worker
- Golden Hour countdown and rapid location sharing via SMS/WhatsApp

## BIMSTEC Coverage

RoadSoS serves BIMSTEC emergency discovery flows for:

- India
- Bangladesh
- Nepal
- Bhutan
- Sri Lanka
- Myanmar
- Thailand
- Maldives

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)

## Install

From the project root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

## Run (client + server concurrently)

From the project root:

```bash
npm run dev
```

App and API default URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## Other scripts

```bash
npm run dev:client
npm run dev:server
npm run build
npm run start
```

## Hackathon Submission

Built for **Road Safety Hackathon 2026** by **IIT Madras CoERS**.
