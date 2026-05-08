@echo off
echo Iniciando sistema UCC Control...

REM PostgREST en puerto 3001
start "PostgREST" /min cmd /c "cd /d C:\Users\soporte.vil\Desktop\postgrest && postgrest.exe postgrest.conf"

REM Proxy /rest/v1 en puerto 3000
start "Proxy API" /min cmd /c "node C:\Users\soporte.vil\Desktop\postgrest\proxy.js"

REM Frontend en puerto 80
start "Frontend" /min cmd /c "cd /d C:\Users\soporte.vil\Desktop\ucc-control-acceso && serve -s dist -l 80"

echo.
echo Sistema iniciado:
echo   Frontend:  http://172.13.0.209
echo   API proxy: http://172.13.0.209:3000
echo.
echo Cierra esta ventana cuando quieras detener todo.
pause

REM Al cerrar esta ventana, detiene los 3 procesos
taskkill /FI "WINDOWTITLE eq PostgREST*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Proxy API*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend*" /F >nul 2>&1
echo Sistema detenido.
