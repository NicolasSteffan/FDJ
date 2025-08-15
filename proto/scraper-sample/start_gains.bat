@echo off
setlocal
pushd %~dp0
if not exist data mkdir data
call "%~dp0delete_resultat.bat" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_gains.ps1"
if exist data\gains.json (echo OK) else (echo ERROR)
popd
endlocal
