@echo off
echo ==========================================
echo FDJ SQLite Backend - Demarrage
echo ==========================================
cd /d "%~dp0"
echo 📁 Repertoire: %cd%
echo 📦 Installation dependencies...
call npm install
echo 🚀 Lancement serveur SQLite...
echo ==========================================
node server.js