@echo off
setlocal
pushd %~dp0
if exist data (
  del /q data\*.* >nul 2>&1
)
popd
endlocal

