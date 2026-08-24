@echo off
cd /d "%~dp0"
echo Applying database schema...
call npx prisma db push
echo Seeding founder account...
call npm run db:seed
echo Done. Now run: npm run dev
pause
