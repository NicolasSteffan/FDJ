@echo off
echo ==========================================
echo    FDJ - OUVERTURE FORCEE NAVIGATEUR
echo ==========================================

echo.
echo Methode PowerShell pour forcer l'ouverture...
echo.

if not exist "apps\web\index-standalone.html" (
    echo ERREUR: Fichier manquant !
    pause
    exit /b 1
)

echo Ouverture avec PowerShell...
powershell -Command "Start-Process '%CD%\apps\web\index-standalone.html'"

echo.
echo Si ca ne marche pas, voici le chemin a copier:
echo.
echo %CD%\apps\web\index-standalone.html
echo.

timeout /t 3 /nobreak >nul

echo Tentative alternative avec rundll32...
rundll32 url.dll,FileProtocolHandler "%CD%\apps\web\index-standalone.html"

echo.
echo ==========================================
echo Si rien ne s'ouvre:
echo 1. Allez dans: apps\web\
echo 2. Double-cliquez: index-standalone.html
echo ==========================================

pause