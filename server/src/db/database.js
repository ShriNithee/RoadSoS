const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.resolve(__dirname, "../../roadsos.db");
const schemaPath = path.resolve(__dirname, "./schema.sql");

const db = new Database(dbPath);

const schemaSql = fs.readFileSync(schemaPath, "utf8");
db.exec(schemaSql);

module.exports = db;
