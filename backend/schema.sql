CREATE TABLE IF NOT EXISTS room (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  settings TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  confirmed_revision INTEGER NOT NULL DEFAULT -1,
  display_seen INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO room (id, settings) VALUES (1, '{"theme":"calm","mode":"dark","view":"weather"}');

CREATE TABLE IF NOT EXISTS pairing (id INTEGER PRIMARY KEY CHECK (id = 1), code_hash TEXT NOT NULL, expires INTEGER NOT NULL);
