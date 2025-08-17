@echo off
setlocal

echo ==========================================
echo FDJ - VERSION V0.002F-HISTORIQUE-SQLITE
echo SERVEUR BACKEND + FRONTEND LOCALHOST
echo ==========================================

set "WEB_DIR=%CD%\apps\web"

echo.
echo 📂 Repertoire: %WEB_DIR%
echo 🎯 Backend: http://localhost:3001
echo 🎯 Frontend: http://localhost:3010
echo.

echo 🔄 Arret processus existants...
taskkill /F /IM node.exe 2>nul || echo ℹ️ Aucun node a arreter
timeout /t 1 /nobreak >nul

echo.
echo 🚀 DEMARRAGE BACKEND SQLITE...
echo ==========================================
start "BACKEND FDJ SQLite" cmd /k "cd /d backend && npm install && echo. && echo 🚀 Backend SQLite demarre sur http://localhost:3001 && echo ========================================== && node server.js"

echo ⏳ Attente demarrage backend (3 secondes)...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 DEMARRAGE FRONTEND...
echo ==========================================
cd /d "%WEB_DIR%"

start "SERVEUR FDJ Frontend" cmd /k "echo 🌐 Frontend demarre sur http://localhost:3010 && echo ========================================== && npx live-server --port=3010 --no-browser"

echo ⏳ Attente demarrage frontend (5 secondes)...
timeout /t 5 /nobreak >nul

echo 🔗 LANCEMENT NAVIGATEUR...
start "" "msedge.exe" "http://localhost:3010" 2>nul && (
    echo ✅ Microsoft Edge lance avec succes !
    goto :success
) || (
    start "" "http://localhost:3010" 2>nul
    echo ✅ Navigateur par defaut lance !
)

:success
echo.
echo ==========================================
echo ✅ SERVEURS + NAVIGATEUR LANCES
echo ==========================================
echo 🎯 Backend SQLite: http://localhost:3001
echo 🎯 Frontend: http://localhost:3010
echo 📂 Repertoire: %WEB_DIR%
echo.
echo 📋 INSTRUCTIONS:
echo - Microsoft Edge devrait s'ouvrir automatiquement
echo - Sinon ouvrez manuellement: http://localhost:3010
echo - Pour arreter: fermez les fenetres "BACKEND" et "SERVEUR"
echo 🔧 VERSION V0.002F-HISTORIQUE-SQLITE CARACTERISTIQUES:
echo - Backend SQLite file-based partage
echo - API REST complete avec CORS
echo - Base de donnees persistante SQLite
echo - PAGE HISTORIQUE connectee a SQLite avec fallback localStorage
echo - Page Tirage + Page Historique 100%% SQLite fonctionnelles
echo - Pagination intelligente et gestion d'erreurs robuste
echo - Monitoring autonome en temps reel
echo - Compatible deploiement multi-utilisateurs
echo - Interface Admin modernisee
echo - Donnees partagees entre utilisateurs
echo - CSS ENTIEREMENT EXTERNE - 100%% bible.md conforme
echo - Architecture CSS modulaire complete
echo - Index.html totalement nettoye (ZERO CSS inline)
echo - Conforme bible.md regles 3, 7 et 8
echo ==========================================

cd /d "%~dp0"

REM Auto-fermeture après 5 secondes
echo.
echo Fermeture automatique dans 5 secondes...
timeout /t 5 /nobreak >nul
exit