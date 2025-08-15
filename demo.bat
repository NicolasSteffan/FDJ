@echo off
echo ==========================================
echo      FDJ - DEMO ARCHITECTURE OOP
echo ==========================================
echo.

echo Verification du fichier demo...
if not exist "apps\web\index-standalone.html" (
    echo ERREUR: Fichier index-standalone.html manquant !
    echo.
    echo Veuillez vous assurer que le fichier existe:
    echo apps\web\index-standalone.html
    echo.
    pause
    exit /b 1
)

echo Fichier demo trouve: apps\web\index-standalone.html
echo.

echo Ouverture de la demonstration...
echo.

REM Essayer Firefox d'abord
where firefox >nul 2>&1
if %errorlevel% == 0 (
    echo Lancement avec Firefox...
    start firefox "apps\web\index-standalone.html"
    goto :success
)

REM Essayer Chrome
where chrome >nul 2>&1
if %errorlevel% == 0 (
    echo Lancement avec Chrome...
    start chrome "apps\web\index-standalone.html"
    goto :success
)

REM Navigateur par defaut
echo Lancement avec le navigateur par defaut...
start "" "apps\web\index-standalone.html"

:success
echo.
echo ==========================================
echo       DEMO ARCHITECTURE OOP LANCEE !
echo ==========================================
echo.
echo La demonstration de l'architecture OOP refactorisee
echo est maintenant ouverte dans votre navigateur.
echo.
echo FONCTIONNALITES DEMONSTREES:
echo.
echo * Navigation entre sections
echo * Composants de boules de loterie
echo * Selecteur de source de donnees  
echo * Tableau de donnees interactif
echo * Tests d'architecture OOP
echo * Generateur de tirages aleatoires
echo.
echo ARCHITECTURE VISIBLE:
echo * Modeles: Draw, Prediction, DataSource
echo * Services: ScrapingService, DataService
echo * Controleurs: DrawController, UIController  
echo * Composants: LotteryBall, Pagination
echo * Styles: CSS modulaires separes
echo.
echo Cette version fonctionne sans serveur !
echo Pour la version complete avec modules ES6,
echo utilisez: go.bat
echo.

pause