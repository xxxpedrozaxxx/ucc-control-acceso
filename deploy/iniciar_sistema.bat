@echo off
echo Deteniendo procesos anteriores en puertos 3000 y 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R "0.0.0.0:3000 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R "0.0.0.0:3001 " 2^>nul') do taskkill /PID %%a /F >nul 2>&1

echo Iniciando sistema UCC Control...

REM PostgREST en puerto 3001 (PATH incluye bin de PostgreSQL para las DLLs)
start "PostgREST" /min cmd /c "set PATH=C:\Program Files\PostgreSQL\18\bin;%PATH% && cd /d C:\Users\soporte.vil\Desktop\postgrest && postgrest.exe postgrest.conf"

REM Esperar a que PostgREST este listo
timeout /t 3 /nobreak >nul

REM Proxy /rest/v1 en puerto 3000
start "Proxy API" /min cmd /c "node C:\Users\soporte.vil\Desktop\postgrest\proxy.js"

REM Frontend en puerto 80
start "Frontend" /min cmd /c "cd /d C:\Users\soporte.vil\Desktop\ucc-control-acceso && serve -s dist -l 80"

echo.
echo Sistema iniciado:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192\|IPv4.*172\|IPv4.*10\."') do (
    for /f "tokens=1" %%b in ("%%a") do echo   Red:       http://%%b  ^(otros equipos^)
)
echo   Local:     http://localhost
echo.
echo Cierra esta ventana cuando quieras detener todo.
pause

REM Al cerrar esta ventana, detiene los 3 procesos
taskkill /FI "WINDOWTITLE eq PostgREST*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Proxy API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>&1
echo Sistema detenido.
