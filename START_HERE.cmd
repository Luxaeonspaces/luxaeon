@echo off
title Luxaeon Spaces Business OS
cd /d "%~dp0"
echo.
echo LUXAEON SPACES - Business OS
echo.
set "PATH=%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs;%PATH%"
where node >nul 2>&1
if errorlevel 1 (
  echo NODE.JS NOT FOUND
  echo Install LTS from https://nodejs.org then RESTART laptop
  pause
  exit /b 1
)
node -v
echo Installing...
call npm.cmd install
call npx.cmd prisma generate
call npx.cmd prisma db push
call npx.cmd tsx prisma/seed.ts
echo.
echo Open http://localhost:3000
echo Login founder / Luxaeon2026
echo.
call npm.cmd run dev
pause
