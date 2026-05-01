const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../db/database");
const { fetchFromOSM } = require("../utils/osm");
const { haversine } = require("../utils/distance");
const { rankServices } = require("../utils/rankServices");

const router = express.Router();

const SUPPORTED_TYPES = new Set([
  "all",
  "hospital",
  "ambulance",
  "police",
  "towing",
  "mechanic",
  "puncture",
  "fuel",
]);

function normalizePhone(phone) {
  return String(phone || "")
    .replace(/\s+/g, "")
    .toLowerCase();
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
    return res.status(400).json({
      error:
        "Invalid type. Use all, hospital, ambulance, police, towing, mechanic, puncture, or fuel.",
    });
  }

  let osmResults = [];
  let dbNearby = [];
  let osmQueryFailed = false;
  let dbQueryFailed = false;

  try {
    if (type === "all") {
      const types = [
        "hospital",
        "ambulance",
        "police",
        "towing",
        "mechanic",
        "puncture",
        "fuel",
      ];
      const responses = await Promise.all(
        types.map((serviceType) =>
          fetchFromOSM(userLat, userLng, serviceType, radiusKm)
        )
      );
      osmResults = responses.flat().map((item) => ({ ...item, source: "osm" }));
    } else {
      const response = await fetchFromOSM(userLat, userLng, type, radiusKm);
      osmResults = response.map((item) => ({ ...item, source: "osm" }));
    }
  } catch (_error) {
    osmQueryFailed = true;
    osmResults = [];
  }

  try {
    const dbQuery =
      type === "all"
        ? "SELECT * FROM emergency_contacts WHERE available = 1"
        : "SELECT * FROM emergency_contacts WHERE available = 1 AND type = ?";

    const dbRows =
      type === "all"
        ? db.prepare(dbQuery).all()
        : db.prepare(dbQuery).all(type);

    dbNearby = dbRows
      .filter((row) => haversine(userLat, userLng, row.lat, row.lng) <= radiusKm)
      .map((row) => ({
        ...row,
        source: "db",
      }));
  } catch (_error) {
    dbQueryFailed = true;
    dbNearby = [];
  }

  if ((osmQueryFailed || osmResults.length === 0) && dbQueryFailed) {
    const offlineFilePath = path.resolve(__dirname, "../data/offlineContacts.json");
    const offlineContacts = JSON.parse(fs.readFileSync(offlineFilePath, "utf8"));
    const offlineNearby = offlineContacts
      .filter((item) => type === "all" || item.type === type)
      .filter((item) => haversine(userLat, userLng, item.lat, item.lng) <= radiusKm)
      .map((item) => ({
        ...item,
        source: "offline",
      }));

    const rankedOffline = rankServices(offlineNearby, userLat, userLng).slice(0, 20);
    return res.json(
      rankedOffline.map((item) => ({
        id: item.id ?? null,
        name: item.name,
        type: item.type,
        phone: item.phone,
        lat: item.lat,
        lng: item.lng,
        address: item.address || "",
        city: item.city || "",
        country: item.country || "",
        distance: item.distance,
        score: item.score,
        verified: Number(item.verified) === 1 ? 1 : 0,
        available: Number(item.available) === 1 ? 1 : 0,
        source: "offline",
      }))
    );
  }

  const shouldSupplement = osmResults.length < 3;
  const mergedInput = shouldSupplement ? [...osmResults, ...dbNearby] : osmResults;

  const dedupedMap = new Map();
  for (const item of mergedInput) {
    const key = normalizePhone(item.phone) || `${item.type}:${item.name}:${item.lat}:${item.lng}`;
    const existing = dedupedMap.get(key);

    if (!existing) {
      dedupedMap.set(key, item);
      continue;
    }

    if (existing.source === "osm" && item.source === "db") {
      dedupedMap.set(key, item);
    }
  }

  const ranked = rankServices(
    Array.from(dedupedMap.values()),
    userLat,
    userLng
  );

  const result = ranked.slice(0, 20).map((item) => ({
    id: item.id ?? null,
    name: item.name,
    type: item.type,
    phone: item.phone,
    lat: item.lat,
    lng: item.lng,
    address: item.address || "",
    city: item.city || "",
    country: item.country || "",
    distance: item.distance,
    score: item.score,
    verified: Number(item.verified) === 1 ? 1 : 0,
    available: Number(item.available) === 1 ? 1 : 0,
    source: item.source,
  }));

  return res.json(result);
});

module.exports = router;
