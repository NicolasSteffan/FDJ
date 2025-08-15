@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
cd /d "%ROOT%"
set "PORT=5174"

echo [GO] Lancement du proto (API+UI)
echo ROOT=%ROOT%
echo PORT=%PORT%

rem 0) Assurer le dossier data
if not exist data mkdir data

rem 1) Installer les deps si besoin
if not exist node_modules (
  where npm
  if not errorlevel 1 (
    echo Installation des dependances npm i ...
    call npm i
  ) else (
    echo ATTENTION: npm introuvable. Assurez-vous que Node.js est installe.
  )
)

rem 2) Demarrer le serveur Express qui sert /ui et /api/scrape
where node
if errorlevel 1 (
  echo ERREUR: Node introuvable. Installez Node.js puis relancez go.bat
  goto :done
)

echo Demarrage serveur: http://localhost:%PORT%
start "API-UI-Server" /D "%ROOT%" cmd /c "node server.mjs"

rem 3) Attendre le demarrage puis ouvrir le navigateur
echo Attente du demarrage (2s)...
ping -n 3 127.0.0.1 >nul
echo Test acces UI...
powershell -NoProfile -Command "try { (Invoke-WebRequest -UseBasicParsing 'http://localhost:%PORT%/ui/index.html' -TimeoutSec 5).StatusCode } catch { Write-Host $_.Exception.Message }"
echo Ouverture du proto UI dans le navigateur
start "UI" "http://localhost:%PORT%/ui/index.html"

:done
echo.
echo [GO] Termine. Cette fenetre va rester ouverte.
echo Appuyez sur une touche pour fermer...
pause >nul
endlocal
exit /b 0

