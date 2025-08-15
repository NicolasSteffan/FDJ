@echo off
setlocal

echo ==========================================
echo FDJ - VERSION V0.000G STABLE
echo SERVEUR + EDGE LOCALHOST:3010
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

echo 🔥 Tentative Microsoft Edge...
start "" "msedge.exe" "http://localhost:3010" 2>nul && (
    echo ✅ Microsoft Edge lance avec succes !
    goto :browser_opened
)

echo 🔥 Tentative Firefox (fallback)...
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
echo ✅ SERVEUR + EDGE LANCES
echo ==========================================
echo.
echo 🌐 URL: http://localhost:3010
echo 📂 Repertoire: %WEB_DIR%
echo.
echo 📋 INSTRUCTIONS:
echo - Microsoft Edge devrait s'ouvrir automatiquement
echo - Fallback Firefox puis navigateur par defaut
echo - Sinon ouvrez manuellement: http://localhost:3010
echo - Pour arreter le serveur: fermez la fenetre "SERVEUR FDJ"
echo.
echo 🏷️ VERSION V0.000G+ CARACTERISTIQUES:
echo - CSS principal integre + LED externes (bible.md conforme)
echo - JavaScript integre (pas de dependances externes)
echo - Interrupteur Mock/Scrap fonctionnel avec LEDs
echo - Boules de loterie avec etoiles personnalisees
echo - Navigation entre sections operationnelle
echo - Sections pliables avec LEDs jaunes (au lieu d icones)
echo - LED jaune animee sur titre (CSS externe style/ClaudS4/)
echo - Conforme bible.md regles 3 et 7
echo.
echo ==========================================

cd /d "%~dp0"

echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul