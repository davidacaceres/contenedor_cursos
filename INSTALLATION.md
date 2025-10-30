
# 📦 Guía de Instalación On-Premise

Esta guía te ayudará a instalar y configurar la Plataforma de Cursos Online en tu propio servidor.

## 📋 Requisitos del Sistema

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4GB
- **Disco:** 20GB de espacio libre
- **Red:** Conexión a internet estable

### Hardware Recomendado (Producción)
- **CPU:** 4+ cores
- **RAM:** 8GB+
- **Disco:** 50GB+ SSD
- **Red:** Conexión de alta velocidad

### Software Requerido
- **Node.js:** v18.x o superior
- **Yarn:** v1.22.x o superior
- **PostgreSQL:** v14.x o superior
- **Git:** v2.x o superior

### Opcional (para producción)
- **Nginx/Apache:** Como reverse proxy
- **PM2:** Para gestión de procesos
- **SSL Certificate:** Para HTTPS (Let's Encrypt recomendado)

---

## 🚀 Instalación Paso a Paso

### 1. Preparar el Entorno

#### Instalar Node.js y Yarn
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Yarn
npm install -g yarn

# Verificar instalación
node --version
yarn --version
```

#### Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar instalación
psql --version
```

### 2. Configurar la Base de Datos

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE plataforma_cursos;
CREATE USER plataforma_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE plataforma_cursos TO plataforma_user;

# Salir
\q
```

### 3. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd plataforma_cursos_online/nextjs_space

# O si ya tienes el código, navega al directorio
cd /ruta/a/plataforma_cursos_online/nextjs_space
```

### 4. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env
nano .env
```

#### Configuración Mínima Requerida

```env
# Base de datos
DATABASE_URL="postgresql://plataforma_user:tu_password_seguro@localhost:5432/plataforma_cursos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera_un_secret_aleatorio_aqui"

# Para generar NEXTAUTH_SECRET, ejecuta:
# openssl rand -base64 32
```

#### Configuración Completa (Recomendada)

```env
# ===================
# DATABASE
# ===================
DATABASE_URL="postgresql://plataforma_user:tu_password_seguro@localhost:5432/plataforma_cursos"

# ===================
# NEXTAUTH
# ===================
NEXTAUTH_URL="http://tu-dominio.com"
NEXTAUTH_SECRET="tu_secret_generado_con_openssl"

# ===================
# STORAGE (Opcional)
# ===================
# Opción 1: Almacenamiento local (por defecto)
STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"

# Opción 2: AWS S3
# STORAGE_TYPE="s3"
# AWS_BUCKET_NAME="tu-bucket"
# AWS_FOLDER_PREFIX="uploads/"
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="tu_access_key"
# AWS_SECRET_ACCESS_KEY="tu_secret_key"

# ===================
# EMAIL (Opcional)
# ===================
# EMAIL_PROVIDER="resend"
# RESEND_API_KEY="tu_api_key_de_resend"
# EMAIL_FROM="noreply@tu-dominio.com"

# ===================
# WHATSAPP (Opcional)
# ===================
# WHATSAPP_PROVIDER="twilio"
# TWILIO_ACCOUNT_SID="tu_account_sid"
# TWILIO_AUTH_TOKEN="tu_auth_token"
# TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# ===================
# GENERAL
# ===================
NODE_ENV="production"
```

### 5. Instalar Dependencias

```bash
# Instalar paquetes
yarn install

# Esto puede tomar varios minutos
```

### 6. Configurar la Base de Datos con Prisma

```bash
# Generar el cliente de Prisma
yarn prisma generate

# Ejecutar migraciones
yarn prisma migrate deploy

# Poblar la base de datos con datos iniciales (opcional)
yarn prisma db seed
```

**Nota:** El seed creará usuarios de prueba:
- **Instructor:** instructor@test.com / password123
- **Estudiante:** student@test.com / password123

### 7. Compilar la Aplicación

```bash
# Compilar para producción
yarn build

# Verificar que no haya errores
```

### 8. Iniciar la Aplicación

#### Modo Desarrollo (para pruebas)
```bash
yarn dev
```
La aplicación estará disponible en `http://localhost:3000`

#### Modo Producción (recomendado)

##### Opción A: Inicio directo
```bash
yarn start
```

##### Opción B: Con PM2 (recomendado para producción)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start yarn --name "plataforma-cursos" -- start

# Configurar PM2 para inicio automático
pm2 startup
pm2 save

# Comandos útiles de PM2
pm2 status              # Ver estado
pm2 logs plataforma-cursos  # Ver logs
pm2 restart plataforma-cursos  # Reiniciar
pm2 stop plataforma-cursos     # Detener
```

---

## 🔧 Configuración de Nginx (Recomendado)

### Instalar Nginx

```bash
sudo apt-get install -y nginx
```

### Configurar Nginx como Reverse Proxy

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/plataforma-cursos
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Timeout para uploads grandes
    client_max_body_size 50M;
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/plataforma-cursos /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática (ya configurada por defecto)
sudo certbot renew --dry-run
```

---

## 🗄️ Configuración de Almacenamiento

### Opción 1: Almacenamiento Local (Por Defecto)

```bash
# Crear directorio de uploads
mkdir -p ./uploads
chmod 755 ./uploads

# En .env
STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"
```

**Importante:** Para producción, asegúrate de que este directorio esté en un volumen persistente.

### Opción 2: AWS S3

1. **Crear bucket en AWS S3**
2. **Configurar políticas de acceso**
3. **Actualizar .env:**

```env
STORAGE_TYPE="s3"
AWS_BUCKET_NAME="tu-bucket"
AWS_FOLDER_PREFIX="uploads/"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="tu_access_key"
AWS_SECRET_ACCESS_KEY="tu_secret_key"
```

Ver `STORAGE_GUIDE.md` para más detalles.

---

## 🔐 Seguridad y Mejores Prácticas

### 1. Configuración de Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar
sudo ufw status
```

### 2. Actualizar el Sistema Regularmente

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get upgrade -y
```

### 3. Backups Automáticos de la Base de Datos

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-plataforma.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/plataforma"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de PostgreSQL
pg_dump -U plataforma_user plataforma_cursos > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup de uploads (si usa local)
tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" /ruta/a/plataforma_cursos_online/nextjs_space/uploads

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-plataforma.sh

# Programar con cron (diario a las 2 AM)
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-plataforma.sh >> /var/log/plataforma-backup.log 2>&1
```

### 4. Monitoreo de Logs

```bash
# Logs de la aplicación (con PM2)
pm2 logs plataforma-cursos

# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 5. Configurar Variables de Entorno Seguras

```bash
# Nunca versionar .env en Git
echo ".env" >> .gitignore

# Generar secrets seguros
openssl rand -base64 32
```

---

## 🔄 Actualización de la Aplicación

```bash
# 1. Hacer backup primero
/usr/local/bin/backup-plataforma.sh

# 2. Detener la aplicación
pm2 stop plataforma-cursos

# 3. Actualizar código
git pull origin main

# 4. Instalar dependencias nuevas
yarn install

# 5. Ejecutar migraciones de base de datos
yarn prisma migrate deploy
yarn prisma generate

# 6. Recompilar
yarn build

# 7. Reiniciar aplicación
pm2 restart plataforma-cursos

# 8. Verificar estado
pm2 status
pm2 logs plataforma-cursos --lines 50
```

---

## 🐛 Solución de Problemas

### La aplicación no inicia

```bash
# Verificar logs
pm2 logs plataforma-cursos --lines 100

# Verificar variables de entorno
cat .env

# Verificar puerto 3000
sudo netstat -tulpn | grep 3000
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Probar conexión
psql -U plataforma_user -d plataforma_cursos -h localhost

# Verificar DATABASE_URL en .env
```

### Error en migraciones de Prisma

```bash
# Resetear base de datos (¡CUIDADO! Elimina todos los datos)
yarn prisma migrate reset

# O aplicar migraciones manualmente
yarn prisma migrate deploy
```

### Problemas de permisos en uploads

```bash
# Verificar permisos
ls -la ./uploads

# Ajustar permisos
chmod 755 ./uploads
chown -R $USER:$USER ./uploads
```

### Puerto 3000 ya en uso

```bash
# Encontrar proceso
sudo lsof -i :3000

# Matar proceso
sudo kill -9 <PID>
```

---

## 📊 Monitoreo y Mantenimiento

### Verificar Salud del Sistema

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Estado de servicios
sudo systemctl status postgresql
sudo systemctl status nginx
pm2 status
```

### Optimización de PostgreSQL

```bash
# Editar configuración
sudo nano /etc/postgresql/14/main/postgresql.conf

# Ajustar según recursos disponibles:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
# wal_buffers = 16MB
# default_statistics_target = 100

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### Limpiar Archivos Temporales

```bash
# Limpiar cache de Next.js
rm -rf .next
yarn build

# Limpiar node_modules (si hay problemas)
rm -rf node_modules
yarn install
```

---

## 📈 Escalabilidad

### Para Alto Tráfico

1. **Load Balancer:** Usar múltiples instancias con Nginx como balanceador
2. **CDN:** CloudFlare o AWS CloudFront para assets estáticos
3. **Database Pooling:** Configurar pgBouncer
4. **Cache:** Redis para sesiones y cache
5. **Horizontal Scaling:** Docker + Kubernetes

### Configuración de Redis (Opcional)

```bash
# Instalar Redis
sudo apt-get install -y redis-server

# Configurar en .env
REDIS_URL="redis://localhost:6379"
```

---

## 📞 Soporte

### Documentación Adicional
- `README.md` - Información general del proyecto
- `STORAGE_GUIDE.md` - Guía de almacenamiento S3/Local
- `DEPLOYMENT.md` - Guía de despliegue

### Recursos
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

### Logs y Reportes de Errores
Al reportar un problema, incluye:
- Versión de Node.js: `node --version`
- Logs de la aplicación: `pm2 logs plataforma-cursos --lines 100`
- Variables de entorno (sin valores sensibles)
- Pasos para reproducir el error

---

## ✅ Checklist Post-Instalación

- [ ] Node.js y Yarn instalados
- [ ] PostgreSQL instalado y configurado
- [ ] Base de datos creada y migrada
- [ ] Variables de entorno configuradas
- [ ] Aplicación compilada sin errores
- [ ] PM2 configurado y funcionando
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado
- [ ] Acceso de prueba funcional

---

## 🎉 ¡Instalación Completada!

Tu plataforma de cursos está lista para usar. Accede a:
- **Frontend:** https://tu-dominio.com
- **Usuarios de prueba:** 
  - Instructor: instructor@test.com / password123
  - Estudiante: student@test.com / password123

**¡No olvides cambiar estos usuarios en producción!**
