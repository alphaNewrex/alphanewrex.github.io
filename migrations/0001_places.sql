-- Aggregated visitor locations. No IPs or per-visitor rows are stored.
CREATE TABLE places (
  country TEXT NOT NULL,
  city    TEXT NOT NULL,           -- '' when Cloudflare has no city for the request
  lat     REAL NOT NULL,           -- rounded to 1 decimal (~10 km)
  lon     REAL NOT NULL,
  visits  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (country, city)
);
