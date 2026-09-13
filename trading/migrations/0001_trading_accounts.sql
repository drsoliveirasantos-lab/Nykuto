CREATE TABLE trading_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  role TEXT NOT NULL CHECK(role IN ('owner','tester')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE trading_state (
  user_id TEXT NOT NULL REFERENCES trading_users(id),
  state_key TEXT NOT NULL,
  value TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, state_key)
);
CREATE TABLE trading_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES trading_users(id),
  category TEXT NOT NULL,
  page TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','reviewing','done')),
  response TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX trading_feedback_user_date ON trading_feedback(user_id, created_at DESC);
