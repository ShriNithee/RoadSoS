const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const { fetchFromOSM } = require("../utils/osm");
const { haversine } = require("../utils/distance");
const { rankServices } = require("../utils/rankServices");

const router = express.Router();

const SUPPORTED_TYPES = new Set([
  "all", "hospital", "ambulance", "police",
  "towing", "mechanic", "puncture", "fuel",
]);

function normalizePhone(phone) {
  return String(phone || "").replace(/\s+/g, "").toLowerCase();
}

router.get("/nearby", async (req, res) => {
  const userLat = Number(req.query.lat);
  const userLng = Number(req.query.lng);

  if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
    return res.status(400).json({
      error: "lat and lng are required and must be valid numbers",
    });
  }

  const type = String(req.query.type || "all").toLowerCase();
  const radius = Number(req.query.radius || 10);
  const radiusKm = Number.isFinite(radius) && radius > 0 ? radius : 10;

  if (!SUPPORTED_TYPES.has(type)) {
    return res.status(400).json({ error: "Invalid type." });
  }

  // --- OSM fetch ---
  let osmResults = [];
  try {
    if (type === "all") {
      const types = ["hospital", "ambulance", "police", "towing", "mechanic", "puncture", "fuel"];
      const responses = await Promise.all(
        types.map((t) => fetchFromOSM(userLat, userLng, t, radiusKm))
      );
      osmResults = responses.flat().map((item) => ({ ...item, source: "osm" }));
    } else {
      const response = await fetchFromOSM(userLat, userLng, type, radiusKm);
      osmResults = response.map((item) => ({ ...item, source: "osm" }));
    }
  } catch (_error) {
    osmResults = [];
  }

  // --- DB fetch — NO radius filter, get all, sort by distance after ---
  let dbRows = [];
  try {
    const dbQuery = type === "all"
      ? "SELECT * FROM emergency_contacts WHERE available = 1"
      : "SELECT * FROM emergency_contacts WHERE available = 1 AND type = ?";
    dbRows = type === "all"
      ? db.prepare(dbQuery).all()
      : db.prepare(dbQuery).all(type);
  } catch (_error) {
    dbRows = [];
  }

  // Attach distance to every DB row
  const dbWithDistance = dbRows.map((row) => ({
    ...row,
    source: "db",
    distance: Math.round(haversine(userLat, userLng, row.lat, row.lng) * 100) / 100,
  }));

  // Prefer contacts within radius, but fall back to ALL sorted by distance
  const dbWithinRadius = dbWithDistance.filter((r) => r.distance <= radiusKm);
  const dbNearby = dbWithinRadius.length >= 3
    ? dbWithinRadius
    : dbWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 20);

  // --- Merge OSM + DB ---
  const shouldSupplement = osmResults.length < 3;
  const mergedInput = shouldSupplement
    ? [...osmResults, ...dbNearby]
    : osmResults;

  // Deduplicate by phone
  const dedupedMap = new Map();
  for (const item of mergedInput) {
    const key = normalizePhone(item.phone) ||
      `${item.type}:${item.name}:${item.lat}:${item.lng}`;
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, item);
    }
  }

  // If still nothing, use offline fallback WITHOUT radius filter
  if (dedupedMap.size === 0) {
    const offlinePath = path.resolve(__dirname, "../data/offlineContacts.json");
    const offline = JSON.parse(fs.readFileSync(offlinePath, "utf8"));
    const filtered = offline
      .filter((item) => type === "all" || item.type === type)
      .map((item) => ({
        ...item,
        source: "offline",
        distance: Math.round(haversine(userLat, userLng, item.lat, item.lng) * 100) / 100,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    return res.json(filtered.map(formatResult));
  }

  const ranked = rankServices(Array.from(dedupedMap.values()), userLat, userLng);
  return res.json(ranked.slice(0, 20).map(formatResult));
});

function formatResult(item) {
  return {
    id: item.id ?? null,
    name: item.name,
    type: item.type,
    phone: item.phone,
    lat: item.lat,
    lng: item.lng,
    address: item.address || "",
    city: item.city || "",
    country: item.country || "",
    distance: item.distance ?? 0,
    score: item.score ?? 0,
    verified: Number(item.verified) === 1 ? 1 : 0,
    available: Number(item.available) === 1 ? 1 : 0,
    source: item.source,
  };
}

module.exports = router;