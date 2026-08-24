@echo off
cd /d "%~dp0"
echo.
echo === Luxaeon Business OS — rebuild database ===
echo.

if not exist "node_modules" (
  echo Installing packages...
  call npm install
)

echo Generating Prisma client...
call npx prisma generate

echo Creating / updating all tables...
call npx prisma db push

echo Seeding founder account...
call npm run db:seed

echo.
echo Done.
echo Login:  username = founder
echo         password = Luxaeon2026
echo.
echo Now run:  npm run dev
echo Then open: http://localhost:3000
echo.
pause
