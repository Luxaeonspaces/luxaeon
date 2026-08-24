@echo off
setlocal
cd /d "%~dp0"

echo === Luxaeon Business OS - Supabase migration ===
echo.

if not exist ".env" (
  echo ERROR: .env was not found.
  echo Copy .env.example to .env and add your Supabase connection strings.
  exit /b 1
)

findstr /b "DATABASE_URL=" .env >nul || (
  echo ERROR: DATABASE_URL is missing from .env.
  exit /b 1
)
findstr /b "DIRECT_URL=" .env >nul || (
  echo ERROR: DIRECT_URL is missing from .env.
  exit /b 1
)

echo Generating Prisma client...
call npx.cmd prisma generate
if errorlevel 1 exit /b 1

echo Applying schema to Supabase...
call npx.cmd prisma db push
if errorlevel 1 exit /b 1

echo Seeding founder account...
call npx.cmd tsx prisma/seed.ts
if errorlevel 1 exit /b 1

echo.
echo Migration complete.
echo Login username: founder
echo Login password: Luxaeon2026
endlocal