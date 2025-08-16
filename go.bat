@echo off
setlocal

echo ==========================================
echo FDJ - VERSION V0.001E-SCRAPING READY
echo SERVEUR + EDGE LOCALHOST:3010
echo ==========================================

set "WEB_DIR=%CD%\apps\web"

echo.
echo 📂 Repertoire: %WEB_DIR%
echo 🌐 URL: http://localhost:3010
echo.

echo 🔄 Arret processus existants...
taskkill /F /IM node.exe 2>nul || echo ℹ️ Aucun node a arreter
timeout /t 1 /nobreak >nul

echo.
echo 🚀 DEMARRAGE SERVEUR LIVE-SERVER...
cd /d "%WEB_DIR%"

start "SERVEUR FDJ" /min cmd /c "live-server --port=3010 --host=localhost --no-browser --entry-file=index.html"

echo ⏳ Attente demarrage serveur (5 secondes)...
timeout /t 5 /nobreak >nul

echo 🔥 LANCEMENT NAVIGATEUR...
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
echo ✅ SERVEUR + NAVIGATEUR LANCES
echo ==========================================
echo 🌐 URL: http://localhost:3010
echo 📂 Repertoire: %WEB_DIR%
echo 📋 INSTRUCTIONS:
echo - Microsoft Edge devrait s'ouvrir automatiquement
echo - Sinon ouvrez manuellement: http://localhost:3010
echo - Pour arreter le serveur: fermez la fenetre "SERVEUR FDJ"
echo 🏷️ VERSION V0.001E-SCRAPING CARACTERISTIQUES:
echo - CSS ENTIEREMENT EXTERNE - 100%% bible.md conforme
echo - Scraping EuroMillions fonctionnel avec detection erreurs
echo - Interrupteur Mock/Scrap avec indicateurs visuels
echo - Architecture CSS modulaire complete:
echo   * homepage-components.css (structure generale)
echo   * lottery-components.css (boules et etoiles NEON ARRONDIES)
echo   * tirage-components.css (page tirage + messages couleur)
echo   * tables-components.css (tableaux et selecteurs)
echo   * switch-components.css (interrupteur position corrigee)
echo   * led-components.css (fleches pliables)
echo - Index.html totalement nettoye (ZERO CSS inline)
echo - Messages coherents: VERT (pas de tirage), ROUGE (erreurs)
echo - Conforme bible.md regles 3, 7 et 8
echo ==========================================

cd /d "%~dp0"

REM Auto-fermeture après 3 secondes
echo.
echo Fermeture automatique dans 3 secondes...
timeout /t 3 /nobreak >nul
exit