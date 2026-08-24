-- Luxaeon Business OS founder seed
-- Run after supabase-migration.sql in Supabase SQL Editor.
-- Login: founder / Luxaeonspaces2026

INSERT INTO "User" (
  "id", "username", "fullName", "passwordHash", "role", "department", "active"
)
VALUES (
  'founder-seed',
  'founder',
  'Oluwabukunmi OMISORE',
  '$2a$10$c5EPVBHvQNG3qKNPLIYYoe9XbEcaG8jOp7.ihIaTAQJpEI2J1SXj2',
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
