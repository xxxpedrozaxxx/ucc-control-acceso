@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  UCC Control de Acceso — Configuracion inicial
REM  Ejecutar UNA SOLA VEZ en un equipo nuevo, como Administrador
REM ============================================================

REM === Verificar privilegios de administrador ===
net session >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Este archivo debe ejecutarse como Administrador.
    echo.
    echo  Instruccion: clic derecho sobre CONFIGURAR.bat
    echo               selecciona "Ejecutar como administrador"
    echo.
    pause
    exit /b 1
)

REM === Directorio base (donde esta este .bat) ===
set "BASE=%~dp0"
if "%BASE:~-1%"=="\" set "BASE=%BASE:~0,-1%"

echo.
echo  ============================================================
echo    UCC Control de Acceso - Instalacion inicial
echo  ============================================================
echo.

REM ============================================================
REM  PASO 1: Verificar Node.js
REM ============================================================
echo  [1/7] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Node.js no encontrado.
    echo  Descarga e instala la version LTS desde:
    echo    https://nodejs.org/
    echo  Luego vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do set "NODE_VER=%%v"
echo  [OK] Node.js !NODE_VER! detectado.

REM ============================================================
REM  PASO 2: Verificar PostgreSQL
REM ============================================================
echo  [2/7] Verificando PostgreSQL...
set "PG_BIN="
for /d %%d in ("C:\Program Files\PostgreSQL\*") do set "PG_BIN=%%d\bin"
if not defined PG_BIN (
    echo.
    echo  [ERROR] PostgreSQL no encontrado en C:\Program Files\PostgreSQL\
    echo  Descarga e instala la version 18 desde:
    echo    https://www.postgresql.org/download/windows/
    echo  Luego vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)
if not exist "!PG_BIN!\psql.exe" (
    echo.
    echo  [ERROR] psql.exe no encontrado en: !PG_BIN!
    echo  Reinstala PostgreSQL e intenta de nuevo.
    echo.
    pause
    exit /b 1
)
echo  [OK] PostgreSQL detectado en: !PG_BIN!

REM ============================================================
REM  PASO 3: Verificar postgrest.exe
REM ============================================================
echo  [3/7] Verificando PostgREST...
if not exist "!BASE!\postgrest\postgrest.exe" (
    echo.
    echo  [ATENCION] Falta el archivo postgrest.exe
    echo.
    echo  Descargalo desde:
    echo    https://github.com/PostgREST/postgrest/releases/tag/v12.2.0
    echo.
    echo  Busca el archivo: postgrest-v12.2.0-windows-x86-64.zip
    echo  Abrelo y copia postgrest.exe en la carpeta:
    echo    !BASE!\postgrest\
    echo.
    echo  Presiona cualquier tecla cuando hayas copiado postgrest.exe...
    pause >nul
    if not exist "!BASE!\postgrest\postgrest.exe" (
        echo  [ERROR] postgrest.exe aun no esta. Vuelve a ejecutar cuando lo copies.
        pause
        exit /b 1
    )
)
echo  [OK] postgrest.exe encontrado.

REM ============================================================
REM  PASO 4: Instalar "serve" (servidor de archivos estaticos)
REM ============================================================
echo  [4/7] Verificando serve...
where serve >nul 2>&1
if errorlevel 1 (
    echo  Instalando serve (requiere internet)...
    npm install -g serve
    if errorlevel 1 (
        echo  [ERROR] No se pudo instalar serve. Verifica tu conexion a internet.
        pause
        exit /b 1
    )
)
echo  [OK] serve disponible.

REM ============================================================
REM  PASO 5: Configurar base de datos PostgreSQL
REM ============================================================
echo.
echo  [5/7] Configurando base de datos...
echo.
echo  Ingresa la contrasena del superusuario "postgres" de PostgreSQL.
echo  (La definiste durante la instalacion de PostgreSQL)
echo.
set /p "PG_ADMIN_PASS=  Contrasena de postgres: "
set "PGPASSWORD=!PG_ADMIN_PASS!"

REM Verificar que la contrasena sea correcta
"!PG_BIN!\psql" -U postgres -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Contrasena incorrecta o PostgreSQL no esta corriendo.
    echo  Verifica que el servicio PostgreSQL este activo e intenta de nuevo.
    echo.
    pause
    exit /b 1
)

REM Crear rol ucc_app si no existe
"!PG_BIN!\psql" -U postgres -c "DO $do$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='ucc_app') THEN CREATE ROLE ucc_app WITH LOGIN PASSWORD 'Gestion2026**'; END IF; END $do$;" >nul 2>&1

REM Crear base de datos ucc_control si no existe
"!PG_BIN!\psql" -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='ucc_control'" 2>nul | findstr /C:"1" >nul
if errorlevel 1 (
    "!PG_BIN!\psql" -U postgres -c "CREATE DATABASE ucc_control OWNER ucc_app;" >nul 2>&1
)

REM Otorgar privilegios
"!PG_BIN!\psql" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ucc_control TO ucc_app;" >nul 2>&1

REM Ejecutar scripts SQL en orden
set "SQL=!BASE!\database\supabase"
echo  Creando tablas...
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\01_usuarios.sql"      2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\02_roles.sql"          2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\03_info_estudiante.sql" 2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\04_info_empleado.sql"   2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\05_info_contratista.sql" 2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\06_triggers_roles.sql"  2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\07_fallas.sql"          2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\08_rls_policies.sql"    2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\09_admins.sql"          2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\10_semestres.sql"       2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\11_setup_inicial.sql"   2>nul
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!SQL!\12_admin_inicial.sql"   2>nul
echo  Aplicando permisos al rol ucc_app...
"!PG_BIN!\psql" -U postgres -d ucc_control -q -f "!BASE!\database\postgresql\08_permisos.sql" 2>nul
echo  [OK] Base de datos lista.

REM ============================================================
REM  PASO 6: Escribir postgrest.conf (UTF-8 sin BOM)
REM ============================================================
echo  [6/7] Creando configuracion de PostgREST...
(
echo db-uri = "postgres://ucc_app:Gestion2026**@localhost:5432/ucc_control"
echo db-schema = "public"
echo db-anon-role = "ucc_app"
echo server-port = 3001
echo jwt-secret = "TGrkLhHOWgAV2f6XIEZbanQD7cYlKeoPtRvqByS0jCN1xsUJ4wd5zMu3m8Fpi9"
echo db-max-rows = 10000
echo log-level = "info"
) > "!BASE!\postgrest\postgrest.conf"

REM Copiar DLLs de PostgreSQL necesarias para postgrest.exe
for %%f in (libpq.dll libssl-3-x64.dll libcrypto-3-x64.dll libintl-9.dll libiconv-2.dll) do (
    if exist "!PG_BIN!\%%f" copy /Y "!PG_BIN!\%%f" "!BASE!\postgrest\" >nul 2>&1
)
echo  [OK] PostgREST configurado.

REM ============================================================
REM  PASO 7: Firewall y acceso directo en Escritorio
REM ============================================================
echo  [7/7] Configurando firewall y acceso directo...

netsh advfirewall firewall delete rule name="UCC Frontend"  >nul 2>&1
netsh advfirewall firewall delete rule name="UCC Proxy API" >nul 2>&1
netsh advfirewall firewall delete rule name="UCC PostgREST" >nul 2>&1
netsh advfirewall firewall add rule name="UCC Frontend"  dir=in action=allow protocol=TCP localport=80   >nul 2>&1
netsh advfirewall firewall add rule name="UCC Proxy API" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
netsh advfirewall firewall add rule name="UCC PostgREST" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1

REM Crear acceso directo en el Escritorio
set "SHORTCUT=%USERPROFILE%\Desktop\Iniciar UCC Control.lnk"
powershell -NoProfile -Command "$ws=New-Object -ComObject WScript.Shell; $s=$ws.CreateShortcut('!SHORTCUT!'); $s.TargetPath='!BASE!\INICIAR.bat'; $s.WorkingDirectory='!BASE!'; $s.Description='Iniciar sistema UCC Control de Acceso'; $s.Save()" 2>nul
echo  [OK] Acceso directo creado en el Escritorio.

REM ============================================================
REM  Detectar IP local para el QR
REM ============================================================
set "LOCAL_IP=no detectada"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /R "IPv4.*192\|IPv4.*172\|IPv4.*10\."') do (
    for /f "tokens=1" %%b in ("%%a") do set "LOCAL_IP=%%b"
)

echo.
echo  ============================================================
echo    Instalacion completada exitosamente
echo  ============================================================
echo.
echo    URL del sistema (para el codigo QR):
echo      http://!LOCAL_IP!
echo.
echo    Credenciales de administrador por defecto:
echo      ID institucional : 000000
echo      Contrasena       : 12345678
echo.
echo    Para iniciar el sistema diariamente:
echo      Doble clic en "Iniciar UCC Control" del Escritorio
echo      (la primera vez ejecutar como administrador)
echo.
echo    IMPORTANTE: Configura una IP estatica en este equipo
echo    para que el codigo QR no cambie.
echo    Ver seccion 5 del manual de instalacion.
echo.
pause
