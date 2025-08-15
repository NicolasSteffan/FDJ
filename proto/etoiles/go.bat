@echo off
chcp 65001 >nul
cls

echo ==========================================
echo PROTOTYPE ETOILES - DESIGNS FDJ
echo SERVEUR + EDGE LOCALHOST:3025
echo ==========================================
echo 🌟 Repertoire: %~dp0
echo 🌐 URL: http://localhost:3025
echo.

echo 🛑 Arret processus existants...
taskkill /F /IM node.exe 2>nul || echo ✅ Aucun node a arreter

echo.
echo 🚀 DEMARRAGE SERVEUR LIVE-SERVER...
echo ⏳ Attente demarrage serveur (5 secondes)...
timeout /t 5 /nobreak >nul

start "SERVEUR PROTOTYPE ETOILES" /min cmd /c "live-server --port=3025 --no-browser"

echo.
echo 🌐 LANCEMENT NAVIGATEUR SUR LOCALHOST:3025
echo 🔥 Tentative Microsoft Edge...
start "" "msedge.exe" "http://localhost:3025" 2>nul && (
    echo ✅ Microsoft Edge lance avec succes !
    goto :browser_opened
)

echo 🔥 Tentative Firefox (fallback)...
start "" "firefox.exe" "http://localhost:3025" 2>nul && (
    echo ✅ Firefox lance avec succes !
    goto :browser_opened
)

echo 🔥 Tentative navigateur par defaut...
start "" "http://localhost:3025" 2>nul && (
    echo ✅ Navigateur par defaut lance !
    goto :browser_opened
)

echo ❌ Erreur: Impossible de lancer un navigateur
goto :end

:browser_opened
echo.
echo ==========================================
echo ✅ SERVEUR + NAVIGATEUR LANCES
echo ==========================================
echo 🌐 URL: http://localhost:3025
echo 🌟 Repertoire: %~dp0
echo.
echo 📋 INSTRUCTIONS:
echo - Le navigateur devrait s'ouvrir automatiquement
echo - Sinon ouvrez manuellement: http://localhost:3025
echo - Pour arreter le serveur: fermez la fenetre "SERVEUR PROTOTYPE ETOILES"
echo.
echo 🎨 PROTOTYPE ETOILES CARACTERISTIQUES:
echo - 12 designs d'etoiles differents
echo - Etoiles grosses (60px) avec chiffres integres
echo - Variantes arrondies et effets visuels
echo - Grid responsive pour comparaison facile
echo - Styles: classique, moderne, neon, cristal, feu...
echo.
echo ==========================================

:end
echo.
pause
