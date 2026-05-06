@echo off
:: =============================================================
:: Actualiza el frontend cuando hay cambios en el codigo
:: EJECUTAR COMO ADMINISTRADOR desde la raiz del proyecto
:: =============================================================

echo Deteniendo servicio frontend...
net stop UCCFrontend

echo.
echo Construyendo nueva version...
call npm run build

echo.
echo Copiando nueva version...
xcopy /E /Y /I dist C:\ucc_frontend\dist

echo.
echo Reiniciando servicio frontend...
net start UCCFrontend

echo.
echo Actualizado correctamente.
pause