const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { seedIfEmpty } = require("./seed");

// Use /tmp in production (Render), local file in development
const isProduction = process.env.NODE_ENV === "production";
const dbPath = isProduction
  ? "/tmp/roadsos.db"
  : path.resolve(__dirname, "../../roadsos.db");

const schemaPath = path.resolve(__dirname, "./schema.sql");

const db = new Database(dbPath);

// Run schema on every startup (CREATE TABLE IF NOT EXISTS is safe)
const schemaSql = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSql);

// Auto-seed if table is empty
seedIfEmpty(db);

module.exports = db;