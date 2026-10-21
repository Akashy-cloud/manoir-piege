@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Le Manoir Piege - Serveur de Jeu

echo ========================================================
echo   LE MANOIR PIEGE - SERVEUR DE JEU
echo ========================================================
echo.

set "PATH=%PATH%;C:\Program Files\nodejs\;C:\Program Files (x86)\nodejs\;%LOCALAPPDATA%\Programs\node\;%APPDATA%\npm\"

:: 1. Verifier si Node.js est installe
where.exe node >nul 2>nul
if errorlevel 1 goto :NODE_MANQUANT
goto :NODE_OK

:NODE_MANQUANT
echo [ERREUR] Node.js n'a pas ete detecte sur ce PC !
echo.
echo Pour lancer le Manoir Piege, vous devez installer Node.js :
echo 1. Rendez-vous sur https://nodejs.org
echo 2. Telechargez et installez la version LTS
echo 3. Relancez ensuite ce fichier demarrer_manoir.bat
echo.
pause
exit /b 1

:NODE_OK

:: 2. Verifier si les modules sont installes
if not exist "node_modules\" goto :INSTALL_DEPS
goto :DEPS_OK

:INSTALL_DEPS
echo [INFO] Premier demarrage detecte sur cette machine...
echo Installation automatique des composants necessaires (npm install)...
echo.
call npm install
if errorlevel 1 goto :INSTALL_FAIL
echo.
echo Composants installes avec succes !
echo.
goto :DEPS_OK

:INSTALL_FAIL
echo [ERREUR] L'installation des dependances a echoue.
echo Verifiez votre connexion Internet et reessayez.
echo.
pause
exit /b 1

:DEPS_OK

:: 3. Liberation du port 3000 si un ancien serveur tourne
echo Verification et liberation du port 3000...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

echo.
echo Demarrage du serveur...
echo.
echo ========================================================
echo   POUR ARRETER LE SERVEUR :
echo   - Fermez simplement cette fenetre noire
echo   - OU double-cliquez sur arreter_manoir.bat
echo ========================================================
echo.

:: Ouvrir automatiquement les ecrans TV et Admin dans le navigateur par defaut
start "" cmd /c "ping 127.0.0.1 -n 3 >nul & start http://localhost:3000/tv.html & start http://localhost:3000/host.html"

node server.js

echo.
echo Le serveur a ete arrete.
pause
