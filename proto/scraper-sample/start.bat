@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"
set "PORT=5174"

echo [1/4] Preparation...
if not exist data mkdir data

rem workspace temporaire pour agréger les sorties entre les étapes
if exist _out rd /s /q _out
mkdir _out >nul 2>&1

echo [2/4] Tirage (numeros/etoiles)...
if exist start_tirage.bat (
  call start_tirage.bat
  if exist data\tirage.json copy /y data\tirage.json _out\tirage.json >nul
) else (
  echo ATTENTION: start_tirage.bat introuvable.
)

echo [3/4] Gains (tirage)...
if exist start_gains.bat (
  call start_gains.bat
  if exist data\gains.json copy /y data\gains.json _out\gains.json >nul
) else (
  echo ATTENTION: start_gains.bat introuvable.
)

echo [4/4] Gains Etoile+...
if exist start_gains_etoile.bat (
  call start_gains_etoile.bat
  if exist data\tirage_etoile.json copy /y data\tirage_etoile.json _out\tirage_etoile.json >nul
) else (
  echo ATTENTION: start_gains_etoile.bat introuvable.
)

rem Restaurer toutes les sorties dans data\
if not exist data mkdir data
for %%F in (tirage.json gains.json tirage_etoile.json) do (
  if exist _out\%%F copy /y _out\%%F data\%%F >nul
)

echo === Recapitulatif fichiers ===
for %%F in (data\tirage.json data\gains.json data\tirage_etoile.json) do (
  if exist "%%F" (
    echo OK  - %%F
  )
  if not exist "%%F" (
    echo N/A - %%F
  )
)

rem Lancer le serveur Node qui expose l'API de scraping et sert l'UI
where node >nul 2>&1
if not errorlevel 1 (
  echo Demarrage du serveur API+UI sur http://localhost:%PORT%
  start "API-UI-Server" /min /D "%ROOT%" cmd /c "node server.mjs"
  rem Attendre le demarrage
  ping -n 3 127.0.0.1 >nul
  echo Ouverture du proto UI dans le navigateur
  start "" "http://localhost:%PORT%/ui/index.html"
  goto :ui_done
)

rem Fallback: http-server (sans /api). Affichera des erreurs sur /api/scrape.
where npx >nul 2>&1
if not errorlevel 1 (
  echo Node introuvable. Demarrage d'un serveur statique (sans API) sur http://localhost:%PORT%
  start "UI-Server" /min /D "%ROOT%" cmd /c "npx --yes http-server -p %PORT% -c-1 --cors . >nul 2>&1"
  ping -n 2 127.0.0.1 >nul
  start "" "http://localhost:%PORT%/ui/index.html"
  goto :ui_done
)

if exist ui\index.html (
  echo Aucun serveur disponible. Ouverture directe (les fetch echoueront)...
  start "" "ui\index.html"
  goto :ui_done
)
echo Interface HTML non presente (ui\index.html manquant). Vous pouvez aussi lancer: npm i && node server.mjs

:ui_done

echo Termine.
endlocal
exit /b 0

