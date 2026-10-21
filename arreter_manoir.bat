@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title Arret du Manoir Piege

echo ========================================================
echo   ARRET DU SERVEUR DU MANOIR PIEGE
echo ========================================================
echo.
echo Arret du serveur en cours...

for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)

echo.
echo ========================================================
echo   Le serveur du Manoir Piege a bien ete arrete !
echo   Le port 3000 est totalement libere.
echo ========================================================
echo.
ping 127.0.0.1 -n 3 >nul
