-- Luxaeon Business OS founder seed
-- Run after supabase-migration.sql in Supabase SQL Editor.
-- Login: founder / Luxaeon2026

INSERT INTO "User" (
  "id", "username", "fullName", "passwordHash", "role", "department", "active"
)
VALUES (
  'founder-seed',
  'founder',
  'Oluwabukunmi OMISORE',
  '$2a$10$.VTOvl8G1xkzdhWJioUQQebo6m2AYocLH/PI9aVQfy.HFKWEUDEb2',
  'Founder',
  'Management',
  true
)
ON CONFLICT ("username") DO UPDATE SET
  "fullName" = EXCLUDED."fullName",
  "passwordHash" = EXCLUDED."passwordHash",
  "role" = EXCLUDED."role",
  "department" = EXCLUDED."department",
  "active" = true;
