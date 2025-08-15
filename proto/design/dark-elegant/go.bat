@echo off
echo.
echo ======================================
echo   FDJ - PROTOTYPE DARK ELEGANT
echo ======================================
echo.
echo Demarrage du prototype Dark Elegant...
echo Style: Interface sombre, accents colores
echo URL: http://localhost:8004
echo.

REM Demarrer un serveur HTTP simple
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8004 2>nul || (
    echo Python non trouve, tentative avec Node.js...
    npx http-server -p 8004 2>nul || (
        echo Serveur HTTP non disponible.
        echo Veuillez ouvrir index.html manuellement.
        pause
        start index.html
    )
)