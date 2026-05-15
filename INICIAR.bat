@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  UCC Control de Acceso — Inicio diario
REM  Ejecutar cada vez que se encienda el equipo
REM  (clic derecho -> Ejecutar como administrador)
REM ============================================================

REM === Directorio base ===
set "BASE=%~dp0"
if "%BASE:~-1%"=="\" set "BASE=%BASE:~0,-1%"

REM === Detectar PostgreSQL ===
set "PG_BIN="
for /d %%d in ("C:\Program Files\PostgreSQL\*") do set "PG_BIN=%%d\bin"

echo.
echo  Deteniendo servicios anteriores...
taskkill /F /IM postgrest.exe /T >nul 2>&1
taskkill /F /IM node.exe       /T >nul 2>&1
timeout /t 2 /nobreak >nul

echo  Iniciando sistema UCC Control...

REM === PostgREST en puerto 3001 ===
start "UCC-PostgREST" /min cmd /c "set PATH=!PG_BIN!;%PATH% && cd /d !BASE!\postgrest && postgrest.exe postgrest.conf"
timeout /t 3 /nobreak >nul

REM === Proxy API en puerto 3000 ===
start "UCC-Proxy"     /min cmd /c "node !BASE!\postgrest\proxy.js"

REM === Frontend en puerto 80 ===
start "UCC-Frontend"  /min cmd /c "node %APPDATA%\npm\node_modules\serve\build\main.js -s !BASE!\dist -l 80"

REM === Detectar IP local ===
set "LOCAL_IP=no detectada"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192\|IPv4.*172\|IPv4.*10\."') do (
    for /f "tokens=1" %%b in ("%%a") do set "LOCAL_IP=%%b"
)

echo.
echo  ============================================================
echo    Sistema iniciado correctamente
echo  ============================================================
echo.
echo    Acceso local   : http://localhost
echo    Acceso en red  : http://!LOCAL_IP!  (otros equipos y celulares)
echo.
echo    Panel admin    : http://!LOCAL_IP!/admin-login
echo    Portal usuario : http://!LOCAL_IP!/login
echo.
echo    Esta ventana mantiene el sistema activo.
echo    Cierra esta ventana para DETENER todo.
echo.
pause

REM === Al cerrar: detener los 3 procesos ===
taskkill /FI "WINDOWTITLE eq UCC-PostgREST*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UCC-Proxy*"     /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UCC-Frontend*"  /F >nul 2>&1
echo  Sistema detenido.
