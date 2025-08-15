@echo off
echo.
echo ======================================
echo   FDJ - PROTOTYPE RETRO VINTAGE
echo ======================================
echo.
echo Demarrage du prototype Retro Vintage...
echo Style: Couleurs chaudes, typographie classique
echo URL: http://localhost:8005
echo.

REM Demarrer un serveur HTTP simple
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8005 2>nul || (
    echo Python non trouve, tentative avec Node.js...
    npx http-server -p 8005 2>nul || (
        echo Serveur HTTP non disponible.
        echo Veuillez ouvrir index.html manuellement.
        pause
        start index.html
    )
)