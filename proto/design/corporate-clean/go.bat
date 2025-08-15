@echo off
echo.
echo ======================================
echo   FDJ - PROTOTYPE CORPORATE CLEAN
echo ======================================
echo.
echo Demarrage du prototype Corporate Clean...
echo Style: Professionnel, bleu/blanc
echo URL: http://localhost:8003
echo.

REM Demarrer un serveur HTTP simple
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8003 2>nul || (
    echo Python non trouve, tentative avec Node.js...
    npx http-server -p 8003 2>nul || (
        echo Serveur HTTP non disponible.
        echo Veuillez ouvrir index.html manuellement.
        pause
        start index.html
    )
)