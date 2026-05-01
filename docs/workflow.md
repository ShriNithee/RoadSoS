# RoadSoS Workflow

## End-to-End User Journey

1. User opens the web app and lands on Home.
2. User presses the SOS button.
3. Browser geolocation fetches current coordinates.
4. Backend queries OpenStreetMap Overpass for nearby emergency services.
5. If OSM has limited data, backend supplements with SQLite emergency contacts.
6. If online sources fail, backend/client fallback to offline emergency contact datasets.
7. Results are ranked by urgency, distance, verification, and availability.
8. User sees ranked cards and map markers in Emergency view.
9. User can call any service in one tap, navigate via maps, and share location instantly.
10. Golden Hour timer starts from 60:00 and continues during triage.

## Ranking Formula

For each service:

- `emergencyPriority`
  - hospital = 40
  - ambulance = 35
  - police = 30
  - towing = 20
  - mechanic = 15
  - puncture = 10
  - fuel = 5
- `distanceScore = max(0, (1 - distanceKm / 50) * 30)`
- `verifiedScore = 20 if verified else 0`
- `availabilityScore = 10 if available else 0`

Final score:

`finalScore = emergencyPriority + distanceScore + verifiedScore + availabilityScore`

Services are sorted by `finalScore` descending.

## BIMSTEC Country Coverage

| Country | Coverage Type |
|---|---|
| India | Seeded emergency contacts + OSM |
| Bangladesh | Seeded emergency contacts + OSM |
| Nepal | Seeded emergency contacts + OSM |
| Bhutan | OSM discovery + app support |
| Sri Lanka | Seeded emergency contacts + OSM |
| Myanmar | OSM discovery + app support |
| Thailand | Seeded emergency contacts + OSM |
| Maldives | OSM discovery + app support |
