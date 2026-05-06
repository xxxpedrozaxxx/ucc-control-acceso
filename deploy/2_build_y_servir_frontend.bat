@echo off
:: =============================================================
:: Construye el frontend y lo registra como servicio de Windows
:: EJECUTAR COMO ADMINISTRADOR desde la raiz del proyecto
::
:: Prerequisitos:
::   1. Node.js instalado (https://nodejs.org)
::   2. NSSM en C:\nssm\nssm.exe
::   3. Haber copiado el .env con los valores correctos
::      (VITE_SUPABASE_URL apuntando al servidor local)
:: =============================================================

echo Instalando dependencias...
call npm install

echo.
echo Construyendo el frontend...
call npm run build

echo.
echo Copiando build al directorio de servicio...
mkdir C:\ucc_frontend 2>nul
xcopy /E /Y /I dist C:\ucc_frontend\dist

echo.
echo Registrando servidor frontend como servicio de Windows...
C:\nssm\nssm.exe install UCCFrontend "node" "C:\ucc_frontend\node_modules\.bin\serve -s dist -l 80"
C:\nssm\nssm.exe set UCCFrontend AppDirectory "C:\ucc_frontend"
C:\nssm\nssm.exe set UCCFrontend DisplayName "UCC Frontend"
C:\nssm\nssm.exe set UCCFrontend Description "App web de control de acceso UCC"
C:\nssm\nssm.exe set UCCFrontend Start SERVICE_AUTO_START
C:\nssm\nssm.exe set UCCFrontend AppStdout "C:\ucc_frontend\logs\output.log"
C:\nssm\nssm.exe set UCCFrontend AppStderr "C:\ucc_frontend\logs\error.log"

mkdir C:\ucc_frontend\logs 2>nul

:: Instalar serve globalmente si no existe
call npm install -g serve

net start UCCFrontend

echo.
echo Listo. Frontend disponible en http://localhost
echo Desde otras PCs de la red: http://%COMPUTERNAME%
pause