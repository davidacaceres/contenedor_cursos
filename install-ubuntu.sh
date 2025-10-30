
#!/bin/bash

###############################################################################
# Script de Instalación Automática - Plataforma de Cursos Online
# Sistema Operativo: Ubuntu 20.04/22.04 LTS
# Autor: Sistema de Gestión de Aprendizaje
# Versión: 1.0.0
###############################################################################

set -e  # Salir si hay algún error

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Verificar que se ejecuta como usuario normal (no root)
if [ "$EUID" -eq 0 ]; then
    print_error "No ejecutes este script como root. Usa tu usuario normal."
    print_info "El script solicitará permisos sudo cuando sea necesario."
    exit 1
fi

# Banner de bienvenida
clear
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   PLATAFORMA DE CURSOS ONLINE - INSTALACIÓN AUTOMÁTICA  ║
║                                                           ║
║   Sistema de Gestión de Aprendizaje Completo            ║
║   Versión 1.0.0                                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_info "Este script instalará automáticamente todos los componentes necesarios."
print_warning "Asegúrate de tener permisos sudo y conexión a internet estable."
echo ""

# Advertencia especial para instalaciones en /opt
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == /opt/* ]]; then
    print_warning "Detectada instalación en /opt - se requerirán permisos elevados"
    print_info "El script ajustará automáticamente los permisos necesarios"
    echo ""
fi

read -p "¿Deseas continuar con la instalación? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    print_error "Instalación cancelada por el usuario."
    exit 1
fi

###############################################################################
# PASO 1: ACTUALIZAR SISTEMA
###############################################################################

print_header "PASO 1: Actualizando Sistema Operativo"
print_info "Actualizando lista de paquetes..."
sudo apt-get update -qq
print_message "Sistema actualizado correctamente"

###############################################################################
# PASO 2: INSTALAR DEPENDENCIAS BÁSICAS
###############################################################################

print_header "PASO 2: Instalando Dependencias Básicas"

# Verificar e instalar curl
if ! command -v curl &> /dev/null; then
    print_info "Instalando curl..."
    sudo apt-get install -y curl
    print_message "curl instalado"
else
    print_message "curl ya está instalado"
fi

# Verificar e instalar git
if ! command -v git &> /dev/null; then
    print_info "Instalando git..."
    sudo apt-get install -y git
    print_message "git instalado"
else
    print_message "git ya está instalado ($(git --version))"
fi

# Instalar dependencias adicionales
print_info "Instalando dependencias adicionales..."
sudo apt-get install -y build-essential libssl-dev ca-certificates gnupg

###############################################################################
# PASO 3: INSTALAR NODE.JS
###############################################################################

print_header "PASO 3: Instalando Node.js 18.x"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_info "Node.js ya está instalado: $NODE_VERSION"
    
    # Verificar versión mínima (18.x)
    MAJOR_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        print_warning "Versión de Node.js obsoleta. Se actualizará a v18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_message "Node.js actualizado a $(node --version)"
    else
        print_message "Node.js cumple con los requisitos mínimos"
    fi
else
    print_info "Descargando e instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_message "Node.js $(node --version) instalado correctamente"
fi

###############################################################################
# PASO 4: INSTALAR YARN
###############################################################################

print_header "PASO 4: Instalando Yarn"

if command -v yarn &> /dev/null; then
    print_message "Yarn ya está instalado: $(yarn --version)"
else
    print_info "Instalando Yarn globalmente..."
    sudo npm install -g yarn
    print_message "Yarn $(yarn --version) instalado correctamente"
fi

###############################################################################
# PASO 5: INSTALAR POSTGRESQL
###############################################################################

print_header "PASO 5: Instalando PostgreSQL 14"

if command -v psql &> /dev/null; then
    print_message "PostgreSQL ya está instalado: $(psql --version)"
else
    print_info "Instalando PostgreSQL 14..."
    sudo apt-get install -y postgresql postgresql-contrib
    
    # Iniciar y habilitar PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    print_message "PostgreSQL instalado y en ejecución"
fi

# Verificar que PostgreSQL esté corriendo
if sudo systemctl is-active --quiet postgresql; then
    print_message "PostgreSQL está activo y en ejecución"
else
    print_warning "Iniciando servicio PostgreSQL..."
    sudo systemctl start postgresql
fi

###############################################################################
# PASO 6: CONFIGURAR BASE DE DATOS
###############################################################################

print_header "PASO 6: Configurando Base de Datos"

# Solicitar datos de configuración
echo ""
print_info "Configuración de la base de datos PostgreSQL"
echo ""

read -p "Nombre de la base de datos [plataforma_cursos]: " DB_NAME
DB_NAME=${DB_NAME:-plataforma_cursos}

read -p "Usuario de la base de datos [plataforma_user]: " DB_USER
DB_USER=${DB_USER:-plataforma_user}

while true; do
    read -s -p "Contraseña para el usuario de BD (mínimo 8 caracteres): " DB_PASSWORD
    echo ""
    if [ ${#DB_PASSWORD} -ge 8 ]; then
        read -s -p "Confirmar contraseña: " DB_PASSWORD_CONFIRM
        echo ""
        if [ "$DB_PASSWORD" == "$DB_PASSWORD_CONFIRM" ]; then
            break
        else
            print_error "Las contraseñas no coinciden. Inténtalo de nuevo."
        fi
    else
        print_error "La contraseña debe tener al menos 8 caracteres."
    fi
done

# Crear base de datos y usuario
print_info "Creando base de datos y usuario..."

# Verificar si la base de datos ya existe
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "La base de datos '$DB_NAME' ya existe"
else
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    print_message "Base de datos '$DB_NAME' creada"
fi

# Verificar si el usuario ya existe
if sudo -u postgres psql -t -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
    print_warning "El usuario '$DB_USER' ya existe"
    # Actualizar contraseña
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null
    print_message "Contraseña actualizada para el usuario '$DB_USER'"
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null
    print_message "Usuario '$DB_USER' creado"
fi

# Otorgar privilegios
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
print_message "Privilegios otorgados correctamente"

# Construir DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}"

###############################################################################
# PASO 7: CLONAR/VERIFICAR REPOSITORIO
###############################################################################

print_header "PASO 7: Configurando Código Fuente"

# Determinar directorio de instalación
INSTALL_DIR=$(pwd)
print_info "Directorio de instalación: $INSTALL_DIR"

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en el directorio actual"
    print_info "Asegúrate de ejecutar este script desde el directorio nextjs_space"
    exit 1
fi

# Verificar y corregir permisos del directorio de instalación
print_info "Verificando permisos del directorio de instalación..."
INSTALL_DIR_OWNER=$(stat -c '%U' "$INSTALL_DIR")

if [ "$INSTALL_DIR_OWNER" != "$USER" ]; then
    print_warning "El directorio pertenece a '$INSTALL_DIR_OWNER', no a '$USER'"
    print_info "Cambiando propietario del directorio a $USER..."
    
    # Si estamos en /opt, necesitamos sudo
    if [[ "$INSTALL_DIR" == /opt/* ]]; then
        sudo chown -R $USER:$USER "$INSTALL_DIR"
    else
        chown -R $USER:$USER "$INSTALL_DIR" 2>/dev/null || sudo chown -R $USER:$USER "$INSTALL_DIR"
    fi
    
    print_message "Permisos actualizados correctamente"
else
    print_message "Permisos correctos en el directorio"
fi

print_message "Repositorio localizado correctamente"

###############################################################################
# PASO 8: CONFIGURAR VARIABLES DE ENTORNO
###############################################################################

print_header "PASO 8: Configurando Variables de Entorno"

# Generar NEXTAUTH_SECRET
print_info "Generando NEXTAUTH_SECRET seguro..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Solicitar configuración adicional
echo ""
read -p "URL de la aplicación [http://localhost:3000]: " NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}

echo ""
print_info "Configuración de almacenamiento de archivos"
echo "1) Local (almacenamiento en disco)"
echo "2) AWS S3 (almacenamiento en la nube)"
read -p "Selecciona tipo de almacenamiento [1]: " STORAGE_CHOICE
STORAGE_CHOICE=${STORAGE_CHOICE:-1}

# Crear archivo .env
print_info "Creando archivo .env..."

cat > .env << EOF
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DATABASE_URL="${DATABASE_URL}"

# ===========================================
# NEXTAUTH - AUTENTICACIÓN
# ===========================================
NEXTAUTH_URL="${NEXTAUTH_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# ===========================================
# CONFIGURACIÓN GENERAL
# ===========================================
NODE_ENV="production"

# ===========================================
# ALMACENAMIENTO DE ARCHIVOS
# ===========================================
EOF

if [ "$STORAGE_CHOICE" == "1" ]; then
    # Almacenamiento local
    cat >> .env << EOF
STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"

EOF
    
    # Crear directorio de uploads
    mkdir -p ./uploads
    chmod 755 ./uploads
    print_message "Almacenamiento local configurado en ./uploads"
    
else
    # Almacenamiento S3
    echo ""
    print_info "Configuración de AWS S3"
    read -p "Nombre del bucket S3: " AWS_BUCKET_NAME
    read -p "Región AWS [us-east-1]: " AWS_REGION
    AWS_REGION=${AWS_REGION:-us-east-1}
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -s -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    echo ""
    
    cat >> .env << EOF
STORAGE_TYPE="s3"
AWS_BUCKET_NAME="${AWS_BUCKET_NAME}"
AWS_FOLDER_PREFIX="uploads/"
AWS_REGION="${AWS_REGION}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"

EOF
    print_message "Almacenamiento S3 configurado"
fi

# Configuraciones opcionales comentadas
cat >> .env << EOF
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
EOF

print_message "Archivo .env creado correctamente"

###############################################################################
# PASO 9: INSTALAR DEPENDENCIAS NPM
###############################################################################

print_header "PASO 9: Instalando Dependencias del Proyecto"

# Verificar y corregir yarn.lock si es un symlink
if [ -L "yarn.lock" ]; then
    print_warning "Detectado yarn.lock como symlink, corrigiendo..."
    rm yarn.lock
    touch yarn.lock
    print_message "yarn.lock corregido"
fi

# Limpiar instalaciones anteriores problemáticas
if [ -d "node_modules/.prisma" ]; then
    print_info "Limpiando instalación anterior de Prisma..."
    rm -rf node_modules/.prisma
fi

print_info "Instalando dependencias (esto puede tomar varios minutos)..."
yarn install

# Asegurarse de que los permisos sean correctos después de la instalación
if [[ "$INSTALL_DIR" == /opt/* ]]; then
    print_info "Verificando permisos finales de node_modules..."
    sudo chown -R $USER:$USER node_modules 2>/dev/null || true
fi

print_message "Dependencias instaladas correctamente"

###############################################################################
# PASO 10: CONFIGURAR PRISMA Y BASE DE DATOS
###############################################################################

print_header "PASO 10: Configurando Prisma y Migraciones"

# Verificar permisos de node_modules antes de ejecutar prisma
if [ -d "node_modules" ]; then
    print_info "Verificando permisos de node_modules..."
    sudo chown -R $USER:$USER node_modules 2>/dev/null || true
fi

# Configurar directorio de caché local para Prisma (evitar problemas con permisos)
export XDG_CACHE_HOME="$(pwd)/.cache"
mkdir -p .cache
print_info "Usando caché local: $XDG_CACHE_HOME"

print_info "Generando cliente Prisma..."
XDG_CACHE_HOME="$(pwd)/.cache" yarn prisma generate

print_info "Aplicando migraciones de base de datos..."
XDG_CACHE_HOME="$(pwd)/.cache" yarn prisma migrate deploy

print_info "¿Deseas poblar la base de datos con datos iniciales de prueba?"
print_warning "Esto creará usuarios de ejemplo (instructor@test.com y student@test.com)"
read -p "¿Ejecutar seed? (s/n) [s]: " RUN_SEED
RUN_SEED=${RUN_SEED:-s}

if [[ $RUN_SEED =~ ^[SsYy]$ ]]; then
    XDG_CACHE_HOME="$(pwd)/.cache" yarn prisma db seed
    print_message "Base de datos poblada con datos de prueba"
    echo ""
    print_info "Usuarios de prueba creados:"
    echo "   • Instructor: instructor@test.com / password123"
    echo "   • Estudiante: student@test.com / password123"
    echo ""
    print_warning "¡Recuerda cambiar estas contraseñas en producción!"
else
    print_info "Seed omitido. Deberás crear usuarios manualmente."
fi

print_message "Configuración de Prisma completada"

###############################################################################
# PASO 11: COMPILAR APLICACIÓN
###############################################################################

print_header "PASO 11: Compilando Aplicación para Producción"

print_info "Compilando Next.js (esto puede tomar varios minutos)..."
yarn build

print_message "Aplicación compilada exitosamente"

###############################################################################
# PASO 12: INSTALAR PM2 (GESTOR DE PROCESOS)
###############################################################################

print_header "PASO 12: Instalando PM2 (Gestor de Procesos)"

if command -v pm2 &> /dev/null; then
    print_message "PM2 ya está instalado: $(pm2 --version)"
else
    print_info "Instalando PM2 globalmente..."
    sudo npm install -g pm2
    print_message "PM2 instalado correctamente"
fi

###############################################################################
# PASO 13: CONFIGURAR PM2
###############################################################################

print_header "PASO 13: Configurando PM2"

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'plataforma-cursos',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '${INSTALL_DIR}',
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
EOF

print_message "Archivo de configuración PM2 creado"

# Iniciar aplicación con PM2
print_info "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js

# Configurar PM2 para inicio automático
print_info "Configurando PM2 para inicio automático..."
pm2 startup systemd -u $USER --hp $HOME
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save

print_message "PM2 configurado para inicio automático"

###############################################################################
# PASO 14: CONFIGURAR FIREWALL (OPCIONAL)
###############################################################################

print_header "PASO 14: Configuración de Firewall (Opcional)"

if command -v ufw &> /dev/null; then
    print_info "¿Deseas configurar el firewall UFW?"
    read -p "Configurar firewall (s/n) [n]: " CONFIGURE_UFW
    CONFIGURE_UFW=${CONFIGURE_UFW:-n}
    
    if [[ $CONFIGURE_UFW =~ ^[SsYy]$ ]]; then
        print_info "Configurando reglas de firewall..."
        sudo ufw allow 22/tcp comment 'SSH'
        sudo ufw allow 80/tcp comment 'HTTP'
        sudo ufw allow 443/tcp comment 'HTTPS'
        sudo ufw allow 3000/tcp comment 'Next.js App'
        
        print_warning "El firewall se habilitará. Asegúrate de tener acceso SSH."
        read -p "¿Continuar y habilitar firewall? (s/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[SsYy]$ ]]; then
            sudo ufw --force enable
            print_message "Firewall configurado y habilitado"
        else
            print_info "Firewall no habilitado. Puedes habilitarlo más tarde con 'sudo ufw enable'"
        fi
    else
        print_info "Configuración de firewall omitida"
    fi
else
    print_info "UFW no está instalado. Saltando configuración de firewall."
fi

###############################################################################
# PASO 15: CREAR SCRIPT DE BACKUP
###############################################################################

print_header "PASO 15: Configurando Sistema de Backups"

print_info "¿Deseas configurar backups automáticos?"
read -p "Configurar backups (s/n) [s]: " CONFIGURE_BACKUP
CONFIGURE_BACKUP=${CONFIGURE_BACKUP:-s}

if [[ $CONFIGURE_BACKUP =~ ^[SsYy]$ ]]; then
    # Crear directorio de backups
    BACKUP_DIR="/var/backups/plataforma-cursos"
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
    
    # Crear script de backup
    sudo tee /usr/local/bin/backup-plataforma.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="${BACKUP_DIR}"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Backup de PostgreSQL
PGPASSWORD="${DB_PASSWORD}" pg_dump -U ${DB_USER} -h localhost ${DB_NAME} > "\$BACKUP_DIR/db_backup_\$DATE.sql"

# Backup de uploads (si usa almacenamiento local)
if [ -d "${INSTALL_DIR}/uploads" ]; then
    tar -czf "\$BACKUP_DIR/uploads_backup_\$DATE.tar.gz" ${INSTALL_DIR}/uploads
fi

# Mantener solo los últimos 7 días
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: \$DATE"
EOF

    sudo chmod +x /usr/local/bin/backup-plataforma.sh
    
    print_message "Script de backup creado en /usr/local/bin/backup-plataforma.sh"
    
    # Configurar cron
    print_info "¿Deseas programar backups automáticos diarios?"
    read -p "Programar cron job (s/n) [s]: " CONFIGURE_CRON
    CONFIGURE_CRON=${CONFIGURE_CRON:-s}
    
    if [[ $CONFIGURE_CRON =~ ^[SsYy]$ ]]; then
        # Agregar cron job (diario a las 2 AM)
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-plataforma.sh >> /var/log/plataforma-backup.log 2>&1") | crontab -
        print_message "Backup automático programado para las 2:00 AM diariamente"
    fi
else
    print_info "Configuración de backups omitida"
fi

###############################################################################
# PASO 16: VERIFICAR INSTALACIÓN
###############################################################################

print_header "PASO 16: Verificando Instalación"

print_info "Verificando servicios..."

# Verificar PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    print_message "PostgreSQL: Activo"
else
    print_error "PostgreSQL: Inactivo"
fi

# Verificar PM2
if pm2 list | grep -q "plataforma-cursos"; then
    print_message "PM2: Aplicación en ejecución"
else
    print_warning "PM2: Aplicación no está corriendo"
fi

# Verificar puerto 3000
sleep 3
if netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    print_message "Puerto 3000: Escuchando"
else
    print_warning "Puerto 3000: No está escuchando"
fi

###############################################################################
# RESUMEN FINAL
###############################################################################

print_header "¡INSTALACIÓN COMPLETADA!"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  ✓ Plataforma de Cursos Online instalada correctamente  ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

print_info "INFORMACIÓN DE ACCESO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  URL de la aplicación:  ${NEXTAUTH_URL}"
echo "  Base de datos:         ${DB_NAME}"
echo "  Usuario BD:            ${DB_USER}"
echo ""

if [[ $RUN_SEED =~ ^[SsYy]$ ]]; then
    echo "  USUARIOS DE PRUEBA:"
    echo "  ├─ Instructor: instructor@test.com / password123"
    echo "  └─ Estudiante: student@test.com / password123"
    echo ""
    print_warning "¡Cambia estas contraseñas en producción!"
    echo ""
fi

print_info "COMANDOS ÚTILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Ver estado:       pm2 status"
echo "  Ver logs:         pm2 logs plataforma-cursos"
echo "  Reiniciar:        pm2 restart plataforma-cursos"
echo "  Detener:          pm2 stop plataforma-cursos"
echo "  Iniciar:          pm2 start plataforma-cursos"
echo ""

if [[ $CONFIGURE_BACKUP =~ ^[SsYy]$ ]]; then
    echo "  Backup manual:    /usr/local/bin/backup-plataforma.sh"
    echo "  Ver backups:      ls -lh ${BACKUP_DIR}"
    echo ""
fi

print_info "ARCHIVOS DE CONFIGURACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Variables entorno:     ${INSTALL_DIR}/.env"
echo "  Config PM2:            ${INSTALL_DIR}/ecosystem.config.js"
echo "  Logs:                  pm2 logs"
echo ""

print_info "PRÓXIMOS PASOS RECOMENDADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Configurar Nginx como reverse proxy (ver INSTALLATION.md)"
echo "  2. Configurar SSL/HTTPS con Let's Encrypt"
echo "  3. Revisar y ajustar variables de entorno en .env"
echo "  4. Cambiar contraseñas de usuarios de prueba"
echo "  5. Configurar notificaciones por email (opcional)"
echo ""

print_info "DOCUMENTACIÓN ADICIONAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  • INSTALLATION.md  - Guía de instalación detallada"
echo "  • STORAGE_GUIDE.md - Configuración de almacenamiento"
echo "  • DEPLOYMENT.md    - Guía de despliegue"
echo "  • README.md        - Información general del proyecto"
echo ""

print_message "La aplicación está corriendo en: ${NEXTAUTH_URL}"
print_info "Logs en tiempo real: pm2 logs plataforma-cursos"
echo ""

# Guardar información de instalación
cat > INSTALL_INFO.txt << EOF
═══════════════════════════════════════════════════════════
INFORMACIÓN DE INSTALACIÓN - Plataforma de Cursos Online
═══════════════════════════════════════════════════════════

Fecha de instalación: $(date)
Directorio: ${INSTALL_DIR}

CONFIGURACIÓN:
- URL: ${NEXTAUTH_URL}
- Base de datos: ${DB_NAME}
- Usuario BD: ${DB_USER}
- Almacenamiento: $([ "$STORAGE_CHOICE" == "1" ] && echo "Local (./uploads)" || echo "AWS S3")

SERVICIOS:
- PostgreSQL: $(psql --version)
- Node.js: $(node --version)
- Yarn: $(yarn --version)
- PM2: $(pm2 --version)

COMANDOS ÚTILES:
- Estado: pm2 status
- Logs: pm2 logs plataforma-cursos
- Reiniciar: pm2 restart plataforma-cursos

DOCUMENTACIÓN:
Ver archivos *.md en el directorio del proyecto
═══════════════════════════════════════════════════════════
EOF

print_message "Información de instalación guardada en: ${INSTALL_DIR}/INSTALL_INFO.txt"
echo ""
print_message "¡Disfruta de tu plataforma de cursos online! 🎓"
echo ""

