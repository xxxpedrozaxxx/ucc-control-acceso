@echo off
:: =============================================================
:: Registra PostgREST como servicio de Windows con NSSM
:: EJECUTAR COMO ADMINISTRADOR
::
:: Prerequisitos:
::   1. NSSM descargado en C:\nssm\nssm.exe
::      Descarga: https://nssm.cc/download
::   2. postgrest.exe en C:\postgrest\postgrest.exe
::      Descarga: https://github.com/PostgREST/postgrest/releases
::      (elige el archivo postgrest-vX.X.X-windows-x64.zip)
::   3. postgrest.conf copiado a C:\postgrest\postgrest.conf
::      (este archivo, con los valores reales reemplazados)
:: =============================================================

echo Registrando PostgREST como servicio de Windows...

C:\nssm\nssm.exe install PostgREST "C:\postgrest\postgrest.exe" "C:\postgrest\postgrest.conf"
C:\nssm\nssm.exe set PostgREST DisplayName "UCC PostgREST API"
C:\nssm\nssm.exe set PostgREST Description "API REST sobre PostgreSQL para el sistema de control de acceso UCC"
C:\nssm\nssm.exe set PostgREST Start SERVICE_AUTO_START
C:\nssm\nssm.exe set PostgREST AppStdout "C:\postgrest\logs\output.log"
C:\nssm\nssm.exe set PostgREST AppStderr "C:\postgrest\logs\error.log"

mkdir C:\postgrest\logs 2>nul

net start PostgREST

echo.
echo Listo. PostgREST corre en http://localhost:3000
echo Verifica en el navegador: http://localhost:3000/usuarios
pause