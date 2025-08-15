@echo off
echo.
echo ===============================================
echo      FDJ - TOUS LES PROTOTYPES DE DESIGN
echo ===============================================
echo.
echo Lancement de tous les prototypes en parallele...
echo.
echo URLs disponibles:
echo [1] Modern Minimal  : http://localhost:8001
echo [2] Gaming Casino   : http://localhost:8002  
echo [3] Corporate Clean : http://localhost:8003
echo [4] Dark Elegant    : http://localhost:8004
echo [5] Retro Vintage   : http://localhost:8005
echo.
echo ===============================================
echo.

REM Lancer chaque prototype dans sa propre fenetre
start "Modern Minimal" cmd /k "cd modern-minimal && go.bat"
timeout /t 2 /nobreak >nul

start "Gaming Casino" cmd /k "cd gaming-casino && go.bat" 
timeout /t 2 /nobreak >nul

start "Corporate Clean" cmd /k "cd corporate-clean && go.bat"
timeout /t 2 /nobreak >nul

start "Dark Elegant" cmd /k "cd dark-elegant && go.bat"
timeout /t 2 /nobreak >nul

start "Retro Vintage" cmd /k "cd retro-vintage && go.bat"
timeout /t 2 /nobreak >nul

echo Tous les prototypes sont en cours de demarrage...
echo.
echo Ouvrez votre navigateur et visitez les URLs ci-dessus
echo pour comparer les differents styles.
echo.
echo Appuyez sur une touche pour ouvrir la page de navigation...
pause >nul

REM Creer une page de navigation temporaire
echo ^<!DOCTYPE html^> > nav.html
echo ^<html^>^<head^>^<title^>Navigation Prototypes^</title^>^</head^> >> nav.html
echo ^<body style="font-family: Arial; padding: 40px; background: #f0f0f0;"^> >> nav.html
echo ^<h1^>🎨 Prototypes FDJ - Navigation^</h1^> >> nav.html
echo ^<div style="display: grid; gap: 20px; max-width: 800px;"^> >> nav.html
echo ^<a href="http://localhost:8001" style="padding: 20px; background: white; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"^>^<h3^>1. Modern Minimal^</h3^>^<p^>Interface épurée, tons neutres^</p^>^</a^> >> nav.html
echo ^<a href="http://localhost:8002" style="padding: 20px; background: white; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"^>^<h3^>2. Gaming Casino^</h3^>^<p^>Couleurs vives, effets visuels^</p^>^</a^> >> nav.html
echo ^<a href="http://localhost:8003" style="padding: 20px; background: white; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"^>^<h3^>3. Corporate Clean^</h3^>^<p^>Professionnel, bleu/blanc^</p^>^</a^> >> nav.html
echo ^<a href="http://localhost:8004" style="padding: 20px; background: white; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"^>^<h3^>4. Dark Elegant^</h3^>^<p^>Interface sombre, accents colorés^</p^>^</a^> >> nav.html
echo ^<a href="http://localhost:8005" style="padding: 20px; background: white; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"^>^<h3^>5. Retro Vintage^</h3^>^<p^>Couleurs chaudes, typographie classique^</p^>^</a^> >> nav.html
echo ^</div^>^</body^>^</html^> >> nav.html

start nav.html

echo.
echo ✅ Navigation ouverte dans votre navigateur par defaut
echo ✅ Tous les prototypes sont maintenant accessibles
echo.
pause