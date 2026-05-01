CREATE TABLE IF NOT EXISTS emergency_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  phone TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  verified INTEGER DEFAULT 1,
  available INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);
