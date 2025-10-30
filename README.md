
# 📚 Plataforma de Cursos Online - Sistema de Gestión de Aprendizaje (LMS)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Sistema completo de gestión de aprendizaje (Learning Management System) diseñado para instituciones educativas, instructores independientes y organizaciones que desean ofrecer cursos online de forma profesional.

---

## ✨ Características Principales

### 🎓 Para Estudiantes
- **Catálogo de Cursos**: Explora y matricúlate en cursos disponibles
- **Rutas de Aprendizaje**: Sigue trayectorias educativas estructuradas
- **Seguimiento de Progreso**: Visualiza tu avance en tiempo real
- **Tareas y Entregas**: Sube trabajos y recibe calificaciones
- **Exámenes y Cuestionarios**: Realiza evaluaciones con calificación automática
- **Foros de Discusión**: Participa en debates y preguntas con la comunidad
- **Certificados**: Obtén certificados al completar cursos y rutas de aprendizaje
- **Notificaciones**: Recibe alertas sobre nuevos contenidos y actualizaciones

### 👨‍🏫 Para Instructores
- **Gestión de Cursos**: Crea y administra cursos con módulos y lecciones
- **Rutas de Aprendizaje**: Diseña secuencias de cursos relacionados
- **Sistema de Calificaciones**: Califica tareas y proporciona retroalimentación
- **Rúbricas de Evaluación**: Define criterios de evaluación detallados
- **Calificación Automática**: Los cuestionarios de opción múltiple se califican automáticamente
- **Foros Moderados**: Gestiona discusiones y responde preguntas
- **Analytics y Reportes**: Visualiza métricas de desempeño de estudiantes
- **Gestión de Archivos**: Sube y organiza materiales del curso

### 🔐 Seguridad y Autenticación
- Autenticación segura con NextAuth.js
- Roles de usuario (Estudiante, Instructor, Admin)
- Protección de rutas y contenido
- Gestión de sesiones

### 💾 Almacenamiento Flexible
- **Almacenamiento Local**: Para instalaciones on-premise
- **AWS S3**: Para almacenamiento en la nube
- Fácil cambio entre opciones mediante variables de entorno

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con SSR y SSG
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de estilos
- **Radix UI**: Componentes de UI accesibles
- **Shadcn/ui**: Sistema de componentes
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de esquemas

### Backend
- **Next.js API Routes**: Endpoints RESTful
- **Prisma ORM**: Gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **NextAuth.js**: Autenticación y autorización

### Servicios Adicionales
- **AWS SDK v3**: Integración con S3
- **jsPDF**: Generación de certificados PDF
- **React ChartJS 2**: Visualización de datos
- **Date-fns**: Manipulación de fechas
- **Bcrypt**: Encriptación de contraseñas

---

## 📦 Instalación Rápida

### Opción 1: Instalación Automática (Recomendada)

#### En Ubuntu/Linux:
```bash
cd plataforma_cursos_online/nextjs_space
chmod +x install-ubuntu.sh
./install-ubuntu.sh
```

#### En Windows:
```powershell
cd plataforma_cursos_online\nextjs_space
powershell -ExecutionPolicy Bypass -File install-windows.ps1
```

### Opción 2: Instalación Manual

Ver la [Guía de Instalación Completa](./INSTALLATION.md) para instrucciones detalladas paso a paso.

---

## 🚀 Inicio Rápido

### Desarrollo
```bash
# Iniciar servidor de desarrollo
yarn dev
```

Aplicación disponible en: `http://localhost:3000`

### Producción
```bash
# Compilar
yarn build

# Iniciar
yarn start

# O con PM2 (recomendado)
pm2 start ecosystem.config.js
```

---

## 📖 Documentación Completa

- **[INSTALLATION.md](./INSTALLATION.md)** - Guía completa de instalación on-premise
- **[STORAGE_GUIDE.md](./STORAGE_GUIDE.md)** - Configuración de almacenamiento local y S3
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de despliegue en producción

---

## 🗂️ Estructura del Proyecto

```
nextjs_space/
├── app/                      # Directorio principal de la aplicación
│   ├── api/                 # Endpoints de API
│   │   ├── assignments/     # Gestión de tareas
│   │   ├── auth/           # Autenticación
│   │   ├── courses/        # Gestión de cursos
│   │   ├── enrollments/    # Matrículas
│   │   ├── forums/         # Foros de discusión
│   │   ├── learning-paths/ # Rutas de aprendizaje
│   │   ├── progress/       # Seguimiento de progreso
│   │   └── ...
│   ├── auth/               # Páginas de autenticación
│   ├── courses/            # Páginas de cursos
│   ├── instructor/         # Panel de instructor
│   ├── student/            # Panel de estudiante
│   └── page.tsx            # Página principal
├── components/             # Componentes reutilizables
│   ├── instructor/         # Componentes de instructor
│   ├── student/           # Componentes de estudiante
│   ├── forums/            # Componentes de foros
│   └── ui/                # Componentes de interfaz
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts           # Configuración de NextAuth
│   ├── db.ts             # Cliente Prisma
│   ├── storage.ts        # Sistema de almacenamiento
│   ├── aws-config.ts     # Configuración AWS
│   └── types.ts          # Tipos TypeScript
├── prisma/               # Esquema de base de datos
│   └── schema.prisma
├── scripts/              # Scripts de utilidad
│   └── seed.ts          # Datos iniciales
├── public/              # Archivos estáticos
├── .env                 # Variables de entorno
├── install-ubuntu.sh    # Script de instalación para Ubuntu
├── install-windows.ps1  # Script de instalación para Windows
└── package.json         # Dependencias del proyecto
```

---

## 🔧 Configuración

### Variables de Entorno Esenciales

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/plataforma_cursos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secret_generado"

# Almacenamiento
STORAGE_TYPE="local"  # o "s3"
LOCAL_STORAGE_PATH="./uploads"

# AWS S3 (si usas S3)
# AWS_BUCKET_NAME="tu-bucket"
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="tu_access_key"
# AWS_SECRET_ACCESS_KEY="tu_secret_key"
```

Ver [documentación completa de variables de entorno](./INSTALLATION.md#configuración-completa-recomendada).

---

## 👥 Usuarios de Prueba

Después de ejecutar el seed (`yarn prisma db seed`):

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Instructor | instructor@test.com | password123 |
| Estudiante | student@test.com | password123 |

⚠️ **IMPORTANTE**: Cambia estas contraseñas en producción.

---

## 📊 Base de Datos

### Esquema Principal

El sistema utiliza PostgreSQL con las siguientes tablas principales:

- **User**: Usuarios del sistema
- **Course**: Cursos disponibles
- **Module**: Módulos de los cursos
- **Lesson**: Lecciones individuales
- **LearningPath**: Rutas de aprendizaje
- **Enrollment**: Matrículas de estudiantes
- **Assignment**: Tareas y trabajos
- **Submission**: Entregas de estudiantes
- **Quiz**: Cuestionarios y exámenes
- **ForumThread**: Hilos de discusión
- **ForumReply**: Respuestas en foros
- **Certificate**: Certificados generados
- **Notification**: Notificaciones del sistema

Ver esquema completo en [`prisma/schema.prisma`](./prisma/schema.prisma).

---

## 🔄 Comandos Útiles

### Prisma
```bash
# Generar cliente Prisma
yarn prisma generate

# Aplicar migraciones
yarn prisma migrate deploy

# Poblar base de datos
yarn prisma db seed

# Abrir Prisma Studio
yarn prisma studio
```

### PM2 (Gestión de Procesos)
```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs plataforma-cursos

# Reiniciar
pm2 restart plataforma-cursos

# Detener
pm2 stop plataforma-cursos

# Eliminar
pm2 delete plataforma-cursos
```

### Desarrollo
```bash
# Verificar tipos TypeScript
yarn tsc --noEmit

# Linter
yarn lint

# Limpiar caché
rm -rf .next node_modules
yarn install
```

---

## 🐛 Solución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
pm2 logs plataforma-cursos

# Verificar puerto
netstat -tuln | grep 3000

# Verificar variables de entorno
cat .env
```

### Error de base de datos
```bash
# Verificar conexión a PostgreSQL
psql -U usuario -d base_datos -h localhost

# Regenerar Prisma
yarn prisma generate
yarn prisma migrate deploy
```

### Problemas de permisos (uploads)
```bash
# Linux/Mac
chmod 755 ./uploads
chown -R $USER:$USER ./uploads

# Verificar
ls -la ./uploads
```

Ver más soluciones en [INSTALLATION.md](./INSTALLATION.md#solución-de-problemas).

---

## 🔐 Seguridad

### Mejores Prácticas Implementadas

✅ Contraseñas encriptadas con bcrypt  
✅ Variables de entorno para secretos  
✅ Validación de datos en servidor  
✅ Protección CSRF  
✅ Sanitización de inputs  
✅ Autenticación basada en sesiones  
✅ Roles y permisos  

### Recomendaciones Adicionales

- Usa HTTPS en producción
- Configura firewall (UFW en Linux)
- Implementa rate limiting
- Mantén dependencias actualizadas
- Realiza backups regulares
- Monitorea logs de seguridad

---

## 📈 Escalabilidad

### Para Alto Tráfico

1. **Load Balancer**: Múltiples instancias con Nginx
2. **CDN**: CloudFlare o AWS CloudFront
3. **Database Pooling**: pgBouncer para PostgreSQL
4. **Cache**: Redis para sesiones y datos
5. **Horizontal Scaling**: Docker + Kubernetes

### Optimizaciones

- Índices en base de datos
- Lazy loading de imágenes
- Code splitting en Next.js
- Compresión gzip/brotli
- Caché de assets estáticos

---

## 🤝 Contribución

Este proyecto está en desarrollo activo. Si deseas contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

### Versión 1.1.0 (Próxima)
- [ ] Notificaciones por email (Resend)
- [ ] Notificaciones por WhatsApp (Twilio)
- [ ] Sistema de ayuda contextual
- [ ] Chat en vivo entre instructor-estudiante
- [ ] Exportación de reportes en Excel

### Versión 1.2.0
- [ ] Integración con videoconferencias (Zoom/Meet)
- [ ] Gamificación (puntos, badges, leaderboards)
- [ ] Revisión por pares
- [ ] Multi-idioma (i18n)
- [ ] App móvil (React Native)

### Versión 2.0.0
- [ ] AI-powered recommendations
- [ ] Adaptive learning paths
- [ ] Advanced analytics con ML
- [ ] Integración con LTI (Learning Tools Interoperability)

---

## 🆘 Soporte

### Documentación
- [Guía de Instalación](./INSTALLATION.md)
- [Configuración de Almacenamiento](./STORAGE_GUIDE.md)
- [Guía de Despliegue](./DEPLOYMENT.md)

### Recursos Externos
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)

### Reportar Problemas
Al reportar un bug, incluye:
- Versión de Node.js: `node --version`
- Sistema operativo
- Logs relevantes: `pm2 logs plataforma-cursos`
- Pasos para reproducir el error

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Prisma](https://www.prisma.io/) - ORM
- [Shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Radix UI](https://www.radix-ui.com/) - Primitivos de UI
- Toda la comunidad de código abierto

---

## 📞 Contacto

Para preguntas, sugerencias o colaboraciones, abre un issue en el repositorio.

---

<div align="center">

**Hecho con ❤️ para la comunidad educativa**

[⬆ Volver arriba](#-plataforma-de-cursos-online---sistema-de-gestión-de-aprendizaje-lms)

</div>
