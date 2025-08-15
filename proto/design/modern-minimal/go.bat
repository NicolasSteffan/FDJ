@echo off
echo.
echo ======================================
echo   FDJ - PROTOTYPE MODERN MINIMAL
echo ======================================
echo.
echo Demarrage du prototype Modern Minimal...
echo Style: Interface epuree, tons neutres
echo URL: http://localhost:8001
echo.

REM Demarrer un serveur HTTP simple
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8001 2>nul || (
    echo Python non trouve, tentative avec Node.js...
    npx http-server -p 8001 2>nul || (
        echo Serveur HTTP non disponible.
        echo Veuillez ouvrir index.html manuellement.
        pause
        start index.html
    )
)