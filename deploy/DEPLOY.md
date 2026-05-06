# Despliegue local — Sistema de Control de Acceso UCC

## Arquitectura

```
[Cualquier PC de la red]  ->  http://192.168.1.100
                                       |
                             [Servidor Windows]
                               |         |
                         Frontend     PostgREST :3000
                         (serve)           |
                                      PostgreSQL :5432
```

---

## Requisitos del servidor

- Windows 10/11 o Windows Server 2019+
- IP fija en la red local (ej. 192.168.1.100)
- Node.js 18+ instalado: https://nodejs.org
- NSSM (gestor de servicios Windows): https://nssm.cc/download
  -> Descomprimir y copiar nssm.exe a C:\nssm\nssm.exe

---

## Paso 1: Instalar PostgreSQL

1. Descargar instalador: https://www.postgresql.org/download/windows/
2. Instalar con los valores por defecto
3. Anotar la contrasena del usuario postgres
4. PostgreSQL queda como servicio de Windows automatico

---

## Paso 2: Crear la base de datos y ejecutar los scripts

1. Abrir pgAdmin o SQL Shell (psql)
2. Conectarse como usuario postgres
3. Ejecutar en orden los scripts de database/postgresql/:
   - 00_setup.sql   <- crea la BD y el usuario ucc_app
   - Reconectarse a la BD ucc_control como postgres
   - 01_usuarios.sql
   - 02_roles.sql
   - 03_info_estudiante.sql
   - 04_info_empleado.sql
   - 05_info_contratista.sql
   - 06_triggers_roles.sql
   - 07_fallas.sql
   - 08_permisos.sql
   - 09_admins.sql
   - 10_semestres.sql
   - 11_setup_inicial.sql  <- insertar semestre y primer superadmin

---

## Paso 3: Instalar PostgREST

1. Descargar postgrest-vX.X.X-windows-x64.zip desde:
   https://github.com/PostgREST/postgrest/releases
2. Descomprimir y copiar postgrest.exe a C:\postgrest\postgrest.exe
3. Copiar deploy/postgrest.conf a C:\postgrest\postgrest.conf
4. Editar C:\postgrest\postgrest.conf:
   - Reemplazar CambiaEstoAhora123 por la contrasena real de ucc_app
   - Reemplazar REEMPLAZA_CON_TU_JWT_SECRET_AQUI por el JWT secret

---

## Paso 4: Generar JWT_SECRET y anon key

PostgREST necesita un JWT secret para validar peticiones.
La app necesita una "anon key" que es un JWT firmado con ese secret.

### 4a. Generar el JWT_SECRET (en PowerShell):
```powershell
-join ((65..90)+(97..122)+(48..57) | Get-Random -Count 64 | % {[char]$_})
```
Copia el resultado. Es tu JWT_SECRET. Ponlo en postgrest.conf.

### 4b. Generar la anon key
La anon key es un JWT con rol "anon" firmado con tu JWT_SECRET.
Usa este sitio (sin internet: instala jwt-cli):
  https://jwt.io

Payload del JWT:
```json
{
  "role": "ucc_app",
  "iss": "ucc-local",
  "iat": 1700000000,
  "exp": 9999999999
}
```
Firma con tu JWT_SECRET usando algoritmo HS256.
El JWT resultante es tu VITE_SUPABASE_ANON_KEY.

O con Node.js (mas simple):
```bash
node -e "
const jwt = require('jsonwebtoken');
const secret = 'TU_JWT_SECRET_AQUI';
const token = jwt.sign({ role: 'ucc_app', iss: 'ucc-local' }, secret, { algorithm: 'HS256', expiresIn: '99y' });
console.log(token);
"
```
(npm install jsonwebtoken si no esta instalado)

---

## Paso 5: Registrar PostgREST como servicio

1. Abrir PowerShell como Administrador
2. Ir a la carpeta del proyecto
3. Ejecutar: deploy\1_instalar_postgrest_servicio.bat
4. Verificar en el navegador: http://localhost:3000/usuarios
   (debe devolver [] o una lista de usuarios)

---

## Paso 6: Configurar el .env del frontend

1. Copiar deploy/.env.local.example a .env en la raiz del proyecto
2. Editar .env:
   - VITE_SUPABASE_URL=http://192.168.1.100:3000
   - VITE_SUPABASE_ANON_KEY=<el JWT generado en paso 4b>

---

## Paso 7: Build y servir el frontend

1. Abrir PowerShell como Administrador en la raiz del proyecto
2. Ejecutar: deploy\2_build_y_servir_frontend.bat
3. Verificar: http://localhost -> debe mostrar la app
4. Desde otra PC de la red: http://192.168.1.100 -> misma app

---

## Actualizaciones futuras

Cuando haya cambios en el codigo:
1. Actualizar el codigo fuente
2. Ejecutar: deploy\3_actualizar_frontend.bat

---

## Verificacion final

Desde otra PC de la red:
- http://192.168.1.100          -> app de control de acceso
- http://192.168.1.100:3000/usuarios  -> API (debe devolver JSON)

Servicios en el servidor (Administrador de servicios -> services.msc):
- postgresql-x64-XX   -> base de datos
- PostgREST           -> API REST
- UCCFrontend         -> app web

---

## Solucion de problemas

| Problema | Causa probable | Solucion |
|---|---|---|
| La app carga pero no muestra datos | JWT secret no coincide entre postgrest.conf y .env | Verificar que son identicos |
| http://192.168.1.100 no carga desde otra PC | Firewall de Windows bloqueando puertos 80 y 3000 | Abrir puertos en Firewall de Windows Defender |
| PostgREST no arranca | Contrasena de ucc_app incorrecta en postgrest.conf | Verificar contrasena en pgAdmin |
| Error 401 en las queries | anon key mal generada | Regenerar JWT con el mismo JWT_SECRET |

### Abrir puertos en el Firewall (PowerShell como Admin):
```powershell
New-NetFirewallRule -DisplayName "UCC Frontend" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "UCC PostgREST" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```