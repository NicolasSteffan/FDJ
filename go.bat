@echo off
setlocal

echo ==========================================
echo FDJ - SERVEUR + FIREFOX LOCALHOST:3010
echo ==========================================

set "WEB_DIR=%CD%\apps\web"

echo.
echo 📂 Repertoire: %WEB_DIR%
echo 🌐 URL: http://localhost:3010
echo.

echo 🔄 Arret processus existants...
taskkill /F /IM node.exe 2>nul || echo ℹ️ Aucun node a arreter
timeout /t 2 /nobreak >nul

echo.
echo 🚀 DEMARRAGE SERVEUR LIVE-SERVER...
cd /d "%WEB_DIR%"

start "SERVEUR FDJ" cmd /c "live-server --port=3010 --host=localhost --no-browser --entry-file=index.html"

echo ⏳ Attente demarrage serveur (10 secondes)...
timeout /t 10 /nobreak >nul

echo.
echo 🔥 LANCEMENT NAVIGATEUR SUR LOCALHOST:3010
echo.

echo 🔥 Tentative Firefox...
start "" "firefox.exe" "http://localhost:3010" 2>nul && (
    echo ✅ Firefox lance avec succes !
    goto :browser_opened
)

echo 🔥 Tentative navigateur par defaut...
start "" "http://localhost:3010" 2>nul && (
    echo ✅ Navigateur par defaut lance !
    goto :browser_opened
)

echo ❌ Aucun navigateur trouve - ouvrez manuellement http://localhost:3010

:browser_opened

echo.
echo ==========================================
echo ✅ SERVEUR + FIREFOX LANCES
echo ==========================================
echo.
echo 🌐 URL: http://localhost:3010
echo 📂 Repertoire: %WEB_DIR%
echo.
echo 📋 INSTRUCTIONS:
echo - Firefox devrait s'ouvrir automatiquement
echo - Sinon ouvrez manuellement: http://localhost:3010
echo - Pour arreter le serveur: fermez la fenetre "SERVEUR FDJ"
echo.
echo ==========================================

cd /d "%~dp0"

echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul