const express = require("express");
const db = require("../db/database");

const router = express.Router();

const REQUIRED_FIELDS = ["name", "type", "phone", "lat", "lng"];

function validateRequiredFields(payload) {
  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === "") {
      return `${field} is required`;
    }
  }
  return null;
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM emergency_contacts ORDER BY id DESC")
    .all();
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const row = db
    .prepare("SELECT * FROM emergency_contacts WHERE id = ?")
    .get(id);

  if (!row) {
    return res.status(404).json({ error: "Contact not found" });
  }

  return res.json(row);
});

router.post("/", (req, res) => {
  const validationError = validateRequiredFields(req.body || {});
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const lat = toNumber(req.body.lat);
  const lng = toNumber(req.body.lng);
  if (lat === null || lng === null) {
    return res.status(400).json({ error: "lat and lng must be valid numbers" });
  }

  const insert = db.prepare(`
    INSERT INTO emergency_contacts (
      name, type, phone, lat, lng, address, city, country, verified, available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = insert.run(
    req.body.name,
    req.body.type,
    req.body.phone,
    lat,
    lng,
    req.body.address || null,
    req.body.city || null,
    req.body.country || "India",
    toNumber(req.body.verified, 1),
    toNumber(req.body.available, 1)
  );

  const created = db
    .prepare("SELECT * FROM emergency_contacts WHERE id = ?")
    .get(result.lastInsertRowid);

  return res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const existing = db
    .prepare("SELECT * FROM emergency_contacts WHERE id = ?")
    .get(id);
  if (!existing) {
    return res.status(404).json({ error: "Contact not found" });
  }

  const merged = { ...existing, ...(req.body || {}) };
  const validationError = validateRequiredFields(merged);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const lat = toNumber(merged.lat);
  const lng = toNumber(merged.lng);
  if (lat === null || lng === null) {
    return res.status(400).json({ error: "lat and lng must be valid numbers" });
  }

  db.prepare(`
    UPDATE emergency_contacts
    SET name = ?, type = ?, phone = ?, lat = ?, lng = ?,
        address = ?, city = ?, country = ?, verified = ?, available = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.type,
    merged.phone,
    lat,
    lng,
    merged.address || null,
    merged.city || null,
    merged.country || "India",
    toNumber(merged.verified, 1),
    toNumber(merged.available, 1),
    id
  );

  const updated = db
    .prepare("SELECT * FROM emergency_contacts WHERE id = ?")
    .get(id);

  return res.json(updated);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const result = db
    .prepare("DELETE FROM emergency_contacts WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Contact not found" });
  }

  return res.json({ deleted: true });
});

module.exports = router;
