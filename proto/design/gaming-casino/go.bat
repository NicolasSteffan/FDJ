@echo off
echo.
echo ======================================
echo   FDJ - PROTOTYPE GAMING CASINO
echo ======================================
echo.
echo Demarrage du prototype Gaming Casino...
echo Style: Couleurs vives, effets visuels
echo URL: http://localhost:8002
echo.

REM Demarrer un serveur HTTP simple
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8002 2>nul || (
    echo Python non trouve, tentative avec Node.js...
    npx http-server -p 8002 2>nul || (
        echo Serveur HTTP non disponible.
        echo Veuillez ouvrir index.html manuellement.
        pause
        start index.html
    )
)