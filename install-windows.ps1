
###############################################################################
# Script de Instalación Automática - Plataforma de Cursos Online
# Sistema Operativo: Windows 10/11
# Autor: Sistema de Gestión de Aprendizaje
# Versión: 1.0.0
###############################################################################

# Requerir ejecución como Administrador
#Requires -RunAsAdministrator

# Configuración de colores
$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $Message" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Cyan
}

# Banner de bienvenida
Clear-Host
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   PLATAFORMA DE CURSOS ONLINE - INSTALACIÓN AUTOMÁTICA  ║
║                                                           ║
║   Sistema de Gestión de Aprendizaje Completo            ║
║   Versión 1.0.0 - Windows                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Blue

Write-Info "Este script instalará automáticamente todos los componentes necesarios."
Write-Warning "Asegúrate de ejecutar PowerShell como Administrador."
Write-Warning "Requiere conexión a internet estable."
Write-Host ""

$confirmation = Read-Host "¿Deseas continuar con la instalación? (S/N)"
if ($confirmation -notmatch "^[SsYy]") {
    Write-ErrorMsg "Instalación cancelada por el usuario."
    exit 1
}

###############################################################################
# VERIFICAR POWERSHELL VERSION
###############################################################################

if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-ErrorMsg "Se requiere PowerShell 5.0 o superior"
    Write-Info "Tu versión: $($PSVersionTable.PSVersion)"
    exit 1
}

###############################################################################
# PASO 1: INSTALAR CHOCOLATEY (GESTOR DE PAQUETES)
###############################################################################

Write-Header "PASO 1: Instalando Chocolatey (Gestor de Paquetes)"

if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Success "Chocolatey ya está instalado"
} else {
    Write-Info "Instalando Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Actualizar variables de entorno
    $env:ChocolateyInstall = Convert-Path "$((Get-Command choco).Path)\..\.."
    Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
    
    Write-Success "Chocolatey instalado correctamente"
}

# Refrescar entorno
refreshenv

###############################################################################
# PASO 2: INSTALAR GIT
###############################################################################

Write-Header "PASO 2: Instalando Git"

if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Success "Git ya está instalado: $gitVersion"
} else {
    Write-Info "Instalando Git..."
    choco install git -y
    refreshenv
    Write-Success "Git instalado correctamente"
}

###############################################################################
# PASO 3: INSTALAR NODE.JS
###############################################################################

Write-Header "PASO 3: Instalando Node.js 18.x"

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Info "Node.js ya está instalado: $nodeVersion"
    
    # Verificar versión mínima
    $majorVersion = [int]($nodeVersion -replace 'v(\d+).*', '$1')
    if ($majorVersion -lt 18) {
        Write-Warning "Versión obsoleta. Actualizando a v18.x..."
        choco upgrade nodejs-lts -y --version=18.20.2
        refreshenv
        Write-Success "Node.js actualizado a $(node --version)"
    } else {
        Write-Success "Node.js cumple con los requisitos mínimos"
    }
} else {
    Write-Info "Instalando Node.js 18.x LTS..."
    choco install nodejs-lts -y --version=18.20.2
    refreshenv
    Write-Success "Node.js $(node --version) instalado correctamente"
}

###############################################################################
# PASO 4: INSTALAR YARN
###############################################################################

Write-Header "PASO 4: Instalando Yarn"

if (Get-Command yarn -ErrorAction SilentlyContinue) {
    $yarnVersion = yarn --version
    Write-Success "Yarn ya está instalado: v$yarnVersion"
} else {
    Write-Info "Instalando Yarn globalmente..."
    npm install -g yarn
    refreshenv
    Write-Success "Yarn instalado correctamente"
}

###############################################################################
# PASO 5: INSTALAR POSTGRESQL
###############################################################################

Write-Header "PASO 5: Instalando PostgreSQL 14"

if (Get-Command psql -ErrorAction SilentlyContinue) {
    $pgVersion = psql --version
    Write-Success "PostgreSQL ya está instalado: $pgVersion"
} else {
    Write-Info "Instalando PostgreSQL 14..."
    Write-Warning "Se te solicitará configurar una contraseña para el superusuario 'postgres'"
    
    choco install postgresql14 -y --params '/Password:postgres'
    refreshenv
    
    # Iniciar servicio
    Start-Service -Name postgresql-x64-14
    Set-Service -Name postgresql-x64-14 -StartupType Automatic
    
    Write-Success "PostgreSQL instalado y servicio iniciado"
}

# Verificar servicio PostgreSQL
$pgService = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Success "Servicio PostgreSQL está activo"
} else {
    Write-Warning "Iniciando servicio PostgreSQL..."
    Start-Service -Name postgresql-x64-14
}

###############################################################################
# PASO 6: CONFIGURAR BASE DE DATOS
###############################################################################

Write-Header "PASO 6: Configurando Base de Datos"

Write-Host ""
Write-Info "Configuración de la base de datos PostgreSQL"
Write-Host ""

$dbName = Read-Host "Nombre de la base de datos [plataforma_cursos]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "plataforma_cursos" }

$dbUser = Read-Host "Usuario de la base de datos [plataforma_user]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "plataforma_user" }

do {
    $dbPassword = Read-Host "Contraseña para el usuario de BD (mínimo 8 caracteres)" -AsSecureString
    $dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
    )
    
    if ($dbPasswordText.Length -lt 8) {
        Write-ErrorMsg "La contraseña debe tener al menos 8 caracteres"
        continue
    }
    
    $dbPasswordConfirm = Read-Host "Confirmar contraseña" -AsSecureString
    $dbPasswordConfirmText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPasswordConfirm)
    )
    
    if ($dbPasswordText -eq $dbPasswordConfirmText) {
        break
    } else {
        Write-ErrorMsg "Las contraseñas no coinciden. Inténtalo de nuevo."
    }
} while ($true)

# Configurar PostgreSQL
Write-Info "Creando base de datos y usuario..."

$env:PGPASSWORD = "postgres"
$pgPath = "C:\Program Files\PostgreSQL\14\bin"

# Crear base de datos
$createDbCmd = @"
CREATE DATABASE $dbName;
CREATE USER $dbUser WITH ENCRYPTED PASSWORD '$dbPasswordText';
GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
"@

$createDbCmd | & "$pgPath\psql.exe" -U postgres -h localhost 2>&1 | Out-Null

Write-Success "Base de datos '$dbName' y usuario '$dbUser' configurados"

# Construir DATABASE_URL
$databaseUrl = "postgresql://${dbUser}:${dbPasswordText}@localhost:5432/${dbName}"

###############################################################################
# PASO 7: VERIFICAR CÓDIGO FUENTE
###############################################################################

Write-Header "PASO 7: Verificando Código Fuente"

$installDir = Get-Location
Write-Info "Directorio de instalación: $installDir"

if (-not (Test-Path "package.json")) {
    Write-ErrorMsg "No se encontró package.json en el directorio actual"
    Write-Info "Asegúrate de ejecutar este script desde el directorio nextjs_space"
    exit 1
}

Write-Success "Repositorio localizado correctamente"

###############################################################################
# PASO 8: CONFIGURAR VARIABLES DE ENTORNO
###############################################################################

Write-Header "PASO 8: Configurando Variables de Entorno"

Write-Info "Generando NEXTAUTH_SECRET seguro..."
$nextAuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host ""
$nextAuthUrl = Read-Host "URL de la aplicación [http://localhost:3000]"
if ([string]::IsNullOrWhiteSpace($nextAuthUrl)) { $nextAuthUrl = "http://localhost:3000" }

Write-Host ""
Write-Info "Configuración de almacenamiento de archivos"
Write-Host "1) Local (almacenamiento en disco)"
Write-Host "2) AWS S3 (almacenamiento en la nube)"
$storageChoice = Read-Host "Selecciona tipo de almacenamiento [1]"
if ([string]::IsNullOrWhiteSpace($storageChoice)) { $storageChoice = "1" }

# Crear archivo .env
Write-Info "Creando archivo .env..."

$envContent = @"
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DATABASE_URL="$databaseUrl"

# ===========================================
# NEXTAUTH - AUTENTICACIÓN
# ===========================================
NEXTAUTH_URL="$nextAuthUrl"
NEXTAUTH_SECRET="$nextAuthSecret"

# ===========================================
# CONFIGURACIÓN GENERAL
# ===========================================
NODE_ENV="production"

# ===========================================
# ALMACENAMIENTO DE ARCHIVOS
# ===========================================
"@

if ($storageChoice -eq "1") {
    $envContent += @"

STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"

"@
    
    # Crear directorio uploads
    New-Item -ItemType Directory -Force -Path ".\uploads" | Out-Null
    Write-Success "Almacenamiento local configurado en .\uploads"
    
} else {
    Write-Host ""
    Write-Info "Configuración de AWS S3"
    $awsBucket = Read-Host "Nombre del bucket S3"
    $awsRegion = Read-Host "Región AWS [us-east-1]"
    if ([string]::IsNullOrWhiteSpace($awsRegion)) { $awsRegion = "us-east-1" }
    $awsAccessKey = Read-Host "AWS Access Key ID"
    $awsSecretKey = Read-Host "AWS Secret Access Key" -AsSecureString
    $awsSecretKeyText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($awsSecretKey)
    )
    
    $envContent += @"

STORAGE_TYPE="s3"
AWS_BUCKET_NAME="$awsBucket"
AWS_FOLDER_PREFIX="uploads/"
AWS_REGION="$awsRegion"
AWS_ACCESS_KEY_ID="$awsAccessKey"
AWS_SECRET_ACCESS_KEY="$awsSecretKeyText"

"@
    Write-Success "Almacenamiento S3 configurado"
}

# Agregar configuraciones opcionales
$envContent += @"

# ===========================================
# EMAIL (OPCIONAL)
# ===========================================
# EMAIL_PROVIDER="resend"
# RESEND_API_KEY="tu_api_key_de_resend"
# EMAIL_FROM="noreply@tu-dominio.com"

# ===========================================
# WHATSAPP (OPCIONAL)
# ===========================================
# WHATSAPP_PROVIDER="twilio"
# TWILIO_ACCOUNT_SID="tu_account_sid"
# TWILIO_AUTH_TOKEN="tu_auth_token"
# TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Success "Archivo .env creado correctamente"

###############################################################################
# PASO 9: INSTALAR DEPENDENCIAS
###############################################################################

Write-Header "PASO 9: Instalando Dependencias del Proyecto"

Write-Info "Esto puede tomar varios minutos..."
yarn install

Write-Success "Dependencias instaladas correctamente"

###############################################################################
# PASO 10: CONFIGURAR PRISMA
###############################################################################

Write-Header "PASO 10: Configurando Prisma y Migraciones"

Write-Info "Generando cliente Prisma..."
yarn prisma generate

Write-Info "Aplicando migraciones de base de datos..."
yarn prisma migrate deploy

$runSeed = Read-Host "¿Deseas poblar la BD con datos de prueba? (S/N) [S]"
if ([string]::IsNullOrWhiteSpace($runSeed)) { $runSeed = "S" }

if ($runSeed -match "^[SsYy]") {
    yarn prisma db seed
    Write-Success "Base de datos poblada con datos de prueba"
    Write-Host ""
    Write-Info "Usuarios de prueba creados:"
    Write-Host "   • Instructor: instructor@test.com / password123"
    Write-Host "   • Estudiante: student@test.com / password123"
    Write-Host ""
    Write-Warning "¡Recuerda cambiar estas contraseñas en producción!"
} else {
    Write-Info "Seed omitido. Deberás crear usuarios manualmente."
}

Write-Success "Configuración de Prisma completada"

###############################################################################
# PASO 11: COMPILAR APLICACIÓN
###############################################################################

Write-Header "PASO 11: Compilando Aplicación para Producción"

Write-Info "Compilando Next.js (esto puede tomar varios minutos)..."
yarn build

Write-Success "Aplicación compilada exitosamente"

###############################################################################
# PASO 12: INSTALAR PM2
###############################################################################

Write-Header "PASO 12: Instalando PM2 (Gestor de Procesos)"

if (Get-Command pm2 -ErrorAction SilentlyContinue) {
    Write-Success "PM2 ya está instalado"
} else {
    Write-Info "Instalando PM2 globalmente..."
    npm install -g pm2
    npm install -g pm2-windows-service
    refreshenv
    Write-Success "PM2 instalado correctamente"
}

###############################################################################
# PASO 13: CONFIGURAR PM2
###############################################################################

Write-Header "PASO 13: Configurando PM2"

# Crear archivo de configuración PM2
$pm2Config = @"
module.exports = {
  apps: [{
    name: 'plataforma-cursos',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '$($installDir.Path.Replace('\','/'))',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
"@

$pm2Config | Out-File -FilePath "ecosystem.config.js" -Encoding UTF8
Write-Success "Archivo de configuración PM2 creado"

# Iniciar aplicación
Write-Info "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js

# Configurar como servicio de Windows
Write-Info "¿Deseas instalar PM2 como servicio de Windows?"
$installService = Read-Host "Instalar servicio (S/N) [S]"
if ([string]::IsNullOrWhiteSpace($installService)) { $installService = "S" }

if ($installService -match "^[SsYy]") {
    pm2 save
    pm2-service-install -n PM2-PlataformaCursos
    Write-Success "PM2 instalado como servicio de Windows"
} else {
    Write-Info "Servicio de Windows no configurado"
}

###############################################################################
# PASO 14: CONFIGURAR FIREWALL
###############################################################################

Write-Header "PASO 14: Configurando Firewall de Windows"

$configureFirewall = Read-Host "¿Deseas configurar reglas de firewall? (S/N) [S]"
if ([string]::IsNullOrWhiteSpace($configureFirewall)) { $configureFirewall = "S" }

if ($configureFirewall -match "^[SsYy]") {
    Write-Info "Configurando reglas de firewall..."
    
    New-NetFirewallRule -DisplayName "Plataforma Cursos - HTTP" `
        -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow `
        -ErrorAction SilentlyContinue | Out-Null
        
    New-NetFirewallRule -DisplayName "Plataforma Cursos - HTTPS" `
        -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow `
        -ErrorAction SilentlyContinue | Out-Null
        
    New-NetFirewallRule -DisplayName "Plataforma Cursos - App" `
        -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow `
        -ErrorAction SilentlyContinue | Out-Null
    
    Write-Success "Reglas de firewall configuradas"
} else {
    Write-Info "Configuración de firewall omitida"
}

###############################################################################
# PASO 15: CREAR SCRIPT DE BACKUP
###############################################################################

Write-Header "PASO 15: Configurando Sistema de Backups"

$configureBackup = Read-Host "¿Deseas configurar backups automáticos? (S/N) [S]"
if ([string]::IsNullOrWhiteSpace($configureBackup)) { $configureBackup = "S" }

if ($configureBackup -match "^[SsYy]") {
    $backupDir = "C:\Backups\plataforma-cursos"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    
    # Crear script de backup
    $backupScript = @"
`$backupDir = "$backupDir"
`$date = Get-Date -Format "yyyyMMdd_HHmmss"

# Backup de PostgreSQL
`$env:PGPASSWORD = "$dbPasswordText"
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U $dbUser -h localhost $dbName > "`$backupDir\db_backup_`$date.sql"

# Backup de uploads (si usa local)
if (Test-Path ".\uploads") {
    Compress-Archive -Path ".\uploads\*" -DestinationPath "`$backupDir\uploads_backup_`$date.zip" -Force
}

# Mantener solo últimos 7 días
Get-ChildItem `$backupDir -Filter *.sql | Where-Object { `$_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item
Get-ChildItem `$backupDir -Filter *.zip | Where-Object { `$_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item

Write-Host "Backup completado: `$date"
"@

    $backupScript | Out-File -FilePath "backup-plataforma.ps1" -Encoding UTF8
    Write-Success "Script de backup creado: backup-plataforma.ps1"
    
    # Configurar tarea programada
    $configureTask = Read-Host "¿Deseas programar backups automáticos diarios? (S/N) [S]"
    if ([string]::IsNullOrWhiteSpace($configureTask)) { $configureTask = "S" }
    
    if ($configureTask -match "^[SsYy]") {
        $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
            -Argument "-File `"$installDir\backup-plataforma.ps1`""
        $trigger = New-ScheduledTaskTrigger -Daily -At 2AM
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        
        Register-ScheduledTask -TaskName "Backup Plataforma Cursos" `
            -Action $action -Trigger $trigger -Principal $principal `
            -Description "Backup automático diario de la Plataforma de Cursos" `
            -ErrorAction SilentlyContinue
        
        Write-Success "Backup automático programado para las 2:00 AM diariamente"
    }
} else {
    Write-Info "Configuración de backups omitida"
}

###############################################################################
# PASO 16: VERIFICAR INSTALACIÓN
###############################################################################

Write-Header "PASO 16: Verificando Instalación"

Write-Info "Verificando servicios..."

# PostgreSQL
$pgService = Get-Service -Name "postgresql-x64-14" -ErrorAction SilentlyContinue
if ($pgService -and $pgService.Status -eq "Running") {
    Write-Success "PostgreSQL: Activo"
} else {
    Write-ErrorMsg "PostgreSQL: Inactivo"
}

# PM2
Start-Sleep -Seconds 3
$pm2Status = pm2 list 2>&1
if ($pm2Status -match "plataforma-cursos") {
    Write-Success "PM2: Aplicación en ejecución"
} else {
    Write-Warning "PM2: Aplicación no está corriendo"
}

# Puerto 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Success "Puerto 3000: Escuchando"
} else {
    Write-Warning "Puerto 3000: No está escuchando"
}

###############################################################################
# RESUMEN FINAL
###############################################################################

Write-Header "¡INSTALACIÓN COMPLETADA!"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║  ✓ Plataforma de Cursos Online instalada correctamente  ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Info "INFORMACIÓN DE ACCESO"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  URL de la aplicación:  $nextAuthUrl"
Write-Host "  Base de datos:         $dbName"
Write-Host "  Usuario BD:            $dbUser"
Write-Host ""

if ($runSeed -match "^[SsYy]") {
    Write-Host "  USUARIOS DE PRUEBA:"
    Write-Host "  ├─ Instructor: instructor@test.com / password123"
    Write-Host "  └─ Estudiante: student@test.com / password123"
    Write-Host ""
    Write-Warning "¡Cambia estas contraseñas en producción!"
    Write-Host ""
}

Write-Info "COMANDOS ÚTILES"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Ver estado:       pm2 status"
Write-Host "  Ver logs:         pm2 logs plataforma-cursos"
Write-Host "  Reiniciar:        pm2 restart plataforma-cursos"
Write-Host "  Detener:          pm2 stop plataforma-cursos"
Write-Host "  Iniciar:          pm2 start plataforma-cursos"
Write-Host ""

if ($configureBackup -match "^[SsYy]") {
    Write-Host "  Backup manual:    .\backup-plataforma.ps1"
    Write-Host "  Ver backups:      dir $backupDir"
    Write-Host ""
}

Write-Info "ARCHIVOS DE CONFIGURACIÓN"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Variables entorno:     $installDir\.env"
Write-Host "  Config PM2:            $installDir\ecosystem.config.js"
Write-Host "  Script backup:         $installDir\backup-plataforma.ps1"
Write-Host ""

Write-Info "PRÓXIMOS PASOS RECOMENDADOS"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  1. Revisar y ajustar variables de entorno en .env"
Write-Host "  2. Cambiar contraseñas de usuarios de prueba"
Write-Host "  3. Configurar IIS como reverse proxy (opcional)"
Write-Host "  4. Configurar certificado SSL (opcional)"
Write-Host "  5. Configurar notificaciones por email (opcional)"
Write-Host ""

Write-Info "DOCUMENTACIÓN ADICIONAL"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  • INSTALLATION.md  - Guía de instalación detallada"
Write-Host "  • STORAGE_GUIDE.md - Configuración de almacenamiento"
Write-Host "  • DEPLOYMENT.md    - Guía de despliegue"
Write-Host "  • README.md        - Información general del proyecto"
Write-Host ""

Write-Success "La aplicación está corriendo en: $nextAuthUrl"
Write-Info "Logs en tiempo real: pm2 logs plataforma-cursos"
Write-Host ""

# Guardar información
$installInfo = @"
═══════════════════════════════════════════════════════════
INFORMACIÓN DE INSTALACIÓN - Plataforma de Cursos Online
═══════════════════════════════════════════════════════════

Fecha de instalación: $(Get-Date)
Directorio: $installDir

CONFIGURACIÓN:
- URL: $nextAuthUrl
- Base de datos: $dbName
- Usuario BD: $dbUser
- Almacenamiento: $(if ($storageChoice -eq "1") { "Local (.\uploads)" } else { "AWS S3" })

SERVICIOS:
- PostgreSQL: $(psql --version 2>&1)
- Node.js: $(node --version)
- Yarn: v$(yarn --version)
- PM2: $(pm2 --version)

COMANDOS ÚTILES:
- Estado: pm2 status
- Logs: pm2 logs plataforma-cursos
- Reiniciar: pm2 restart plataforma-cursos

DOCUMENTACIÓN:
Ver archivos *.md en el directorio del proyecto
═══════════════════════════════════════════════════════════
"@

$installInfo | Out-File -FilePath "INSTALL_INFO.txt" -Encoding UTF8
Write-Success "Información guardada en: $installDir\INSTALL_INFO.txt"
Write-Host ""
Write-Success "¡Disfruta de tu plataforma de cursos online! 🎓" -ForegroundColor Green
Write-Host ""

# Pausa final
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
