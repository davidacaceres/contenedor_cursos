
# 🎓 Plataforma de Cursos en Línea

Una plataforma completa y moderna de gestión de cursos en línea (LMS - Learning Management System) que permite a múltiples instructores crear y gestionar cursos, y a estudiantes inscribirse y aprender a través de contenido multimedia interactivo.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Características Principales

### Para Instructores 👨‍🏫
- ✅ **Panel de control personalizado** con estadísticas en tiempo real
- ✅ **Gestión completa de cursos**: Crear, editar, eliminar y organizar cursos
- ✅ **Lecciones multimedia**:
  - 📹 Videos de YouTube/Vimeo integrados
  - 📄 Documentos PDF con visualizador integrado
  - 📝 Lecciones de texto con formato Markdown
- ✅ **Sistema de evaluaciones**:
  - Cuestionarios de opción múltiple
  - Calificación automática instantánea
  - Múltiples preguntas por cuestionario
- ✅ **Monitoreo de estudiantes**:
  - Ver lista completa de estudiantes inscritos
  - Seguimiento de progreso individual
  - Historial de calificaciones por estudiante
- ✅ **Organización flexible**: Ordenar lecciones de forma secuencial

### Para Estudiantes 👨‍🎓
- ✅ **Dashboard personalizado** con todos los cursos inscritos
- ✅ **Catálogo de cursos** con información detallada y thumbnails
- ✅ **Inscripción instantánea** con un solo clic
- ✅ **Experiencia de aprendizaje interactiva**:
  - Navegación secuencial entre lecciones
  - Reproductor de video integrado
  - Visor de PDFs en navegador
  - Contenido de texto formateado
- ✅ **Sistema de evaluaciones**:
  - Realizar cuestionarios interactivos
  - Ver resultados inmediatamente
  - Revisar respuestas correctas e incorrectas
- ✅ **Seguimiento de progreso**:
  - Marcar lecciones como completadas
  - Barra de progreso visual por curso
  - Historial completo de calificaciones
  - Porcentaje de avance por curso

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 14** con App Router (React Server Components)
- **TypeScript** para type safety
- **Tailwind CSS** para estilos responsivos
- **Radix UI + shadcn/ui** para componentes accesibles
- **React Hook Form** para formularios
- **TanStack Query** para gestión de estado del servidor

### Backend
- **Next.js API Routes** como backend serverless
- **PostgreSQL** como base de datos relacional
- **Prisma ORM** para consultas type-safe
- **NextAuth.js** para autenticación segura
- **bcryptjs** para hash de contraseñas

### Infraestructura
- **AWS S3** para almacenamiento de archivos
- **Vercel** ready para despliegue instantáneo
- **GitHub Actions** ready para CI/CD

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- Cuenta de AWS (para almacenamiento de archivos PDF)
- Git

## 🛠️ Instalación Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/davidacaceres/contenedor_cursos.git
cd contenedor_cursos
```

### 2. Instalar dependencias
```bash
yarn install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/cursos_db"

# NextAuth - Genera un secret con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secret-key-super-segura-aqui"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 para archivos PDF (opcional para desarrollo)
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=tu-bucket-name
AWS_FOLDER_PREFIX=cursos/
```

### 4. Configurar la base de datos

```bash
# Generar cliente de Prisma
yarn prisma generate

# Ejecutar migraciones (crea las tablas)
yarn prisma migrate dev --name init

# Poblar con datos de ejemplo
yarn prisma db seed
```

### 5. Iniciar servidor de desarrollo

```bash
yarn dev
```

La aplicación estará disponible en **http://localhost:3000**

## 🚀 Despliegue en Vercel (Recomendado)

### Opción 1: Deploy con botón (Más rápido)

[![Deploy with Vercel](https://i.ytimg.com/vi/lAJ6LyvW_cw/hqdefault.jpg)

### Opción 2: Deploy manual

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Deploy desde la terminal**
```bash
cd contenedor_cursos
vercel
```

4. **Configurar variables de entorno en Vercel**
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega:
     - `DATABASE_URL` (tu PostgreSQL en producción)
     - `NEXTAUTH_SECRET` (genera uno nuevo para producción)
     - `NEXTAUTH_URL` (tu URL de Vercel)
     - Variables de AWS S3

5. **Redeploy para aplicar las variables**
```bash
vercel --prod
```

### Base de datos en producción

Para PostgreSQL en producción, recomendamos:
- **[Vercel Postgres](https://vercel.com/storage/postgres)** (integración nativa)
- **[Supabase](https://supabase.com)** (gratuito para empezar)
- **[Railway](https://railway.app)** (PostgreSQL gratis)
- **[Neon](https://neon.tech)** (PostgreSQL serverless)

## 🚀 Otras opciones de despliegue

### Railway

1. Conecta tu repositorio de GitHub
2. Railway detectará Next.js automáticamente
3. Agrega PostgreSQL desde el marketplace
4. Configura las variables de entorno
5. Deploy automático

### Render

1. Crear nuevo "Web Service"
2. Conectar repositorio
3. Build command: `yarn install && yarn build`
4. Start command: `yarn start`
5. Agregar PostgreSQL desde el dashboard
6. Configurar variables de entorno

### DigitalOcean App Platform

1. Crear nueva app desde GitHub
2. Seleccionar el repositorio
3. Configurar como Next.js app
4. Agregar PostgreSQL managed database
5. Configurar variables de entorno

## 👤 Credenciales de Prueba

Después de ejecutar `yarn prisma db seed`, usa estas credenciales:

### 👨‍🏫 Instructores
| Email | Contraseña | Cursos |
|-------|------------|---------|
| maria.garcia@instructor.com | password123 | 2 cursos creados |
| carlos.rodriguez@instructor.com | password123 | 1 curso creado |

### 👨‍🎓 Estudiantes
| Email | Contraseña | Estado |
|-------|------------|---------|
| ana.lopez@student.com | password123 | Inscrita en 2 cursos, con progreso |
| pedro.martinez@student.com | password123 | Inscrito en 2 cursos |
| laura.sanchez@student.com | password123 | Inscrita en 1 curso |

## 📁 Estructura del Proyecto

```
plataforma_cursos_online/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── courses/            # CRUD de cursos
│   │   ├── enrollments/        # Inscripciones
│   │   └── signup/             # Registro de usuarios
│   ├── auth/                    # Páginas de autenticación
│   │   ├── signin/             # Login
│   │   └── signup/             # Registro
│   ├── instructor/              # Panel de instructores
│   │   ├── dashboard/          # Dashboard principal
│   │   └── courses/            # Gestión de cursos
│   ├── student/                 # Panel de estudiantes
│   │   ├── dashboard/          # Dashboard personal
│   │   └── courses/            # Catálogo y cursos
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página de inicio
│   └── globals.css              # Estilos globales
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base (shadcn/ui)
│   ├── instructor/              # Componentes de instructor
│   ├── student/                 # Componentes de estudiante
│   ├── navbar.tsx               # Barra de navegación
│   └── providers.tsx            # Context providers
├── lib/                         # Utilidades
│   ├── auth.ts                  # Configuración NextAuth
│   ├── db.ts                    # Cliente Prisma
│   ├── aws-config.ts            # Configuración AWS S3
│   ├── types.ts                 # Tipos TypeScript
│   └── utils.ts                 # Funciones utilitarias
├── prisma/                      # Base de datos
│   └── schema.prisma            # Esquema de BD
├── scripts/                     # Scripts de utilidad
│   └── seed.ts                  # Datos de prueba
├── types/                       # Definiciones de tipos
│   └── next-auth.d.ts           # Tipos de NextAuth
├── package.json                 # Dependencias
├── tsconfig.json                # Config TypeScript
├── tailwind.config.ts           # Config Tailwind
└── next.config.js               # Config Next.js
```

## 🗄️ Modelo de Base de Datos

```prisma
User (Usuarios)
├── id: String (UUID)
├── name: String
├── email: String (único)
├── password: String (hasheado)
├── role: Enum (INSTRUCTOR | STUDENT)
└── createdAt: DateTime

Course (Cursos)
├── id: String (UUID)
├── title: String
├── description: String
├── thumbnail: String (URL)
├── instructorId: String (FK → User)
├── lessons: Lesson[]
└── enrollments: Enrollment[]

Lesson (Lecciones)
├── id: String (UUID)
├── title: String
├── type: Enum (VIDEO | PDF | TEXT)
├── content: String (para TEXT)
├── videoUrl: String (para VIDEO)
├── pdfUrl: String (para PDF)
├── order: Int
├── duration: Int (minutos)
├── courseId: String (FK → Course)
└── quiz: Quiz?

Quiz (Cuestionarios)
├── id: String (UUID)
├── title: String
├── lessonId: String (FK → Lesson)
└── questions: Question[]

Question (Preguntas)
├── id: String (UUID)
├── text: String
├── optionA/B/C/D: String
├── correctOption: String
├── order: Int
└── quizId: String (FK → Quiz)

Enrollment (Inscripciones)
├── id: String (UUID)
├── userId: String (FK → User)
├── courseId: String (FK → Course)
└── enrolledAt: DateTime

Progress (Progreso)
├── id: String (UUID)
├── userId: String (FK → User)
├── lessonId: String (FK → Lesson)
├── completed: Boolean
└── completedAt: DateTime?

QuizResult (Resultados)
├── id: String (UUID)
├── userId: String (FK → User)
├── quizId: String (FK → Quiz)
├── score: Int
├── answers: JSON
└── completedAt: DateTime
```

## 🎯 Funcionalidades Detalladas

### Sistema de Autenticación
- Registro con validación de email único
- Login seguro con hash bcrypt
- Sesiones con NextAuth.js
- Protección de rutas por rol
- Redirección automática según rol

### Gestión de Cursos (Instructores)
- Crear cursos con formulario validado
- Upload de thumbnails a S3
- Agregar lecciones de múltiples tipos
- Crear cuestionarios con editor visual
- Ver estadísticas de inscripciones
- Editar y eliminar contenido

### Sistema de Lecciones
- **Videos**: Embed de YouTube/Vimeo con reproductor nativo
- **PDFs**: Upload a S3 + visualizador integrado
- **Texto**: Markdown con preview en tiempo real
- Navegación secuencial automática
- Marcado de completadas
- Tiempo estimado por lección

### Evaluaciones Interactivas
- Cuestionarios con múltiples preguntas
- 4 opciones de respuesta (A, B, C, D)
- Calificación automática en tiempo real
- Feedback inmediato (correcto/incorrecto)
- Historial de intentos
- Porcentaje de aciertos

### Dashboard de Estudiantes
- Vista de cursos inscritos con progreso
- Recomendaciones de cursos
- Gráficas de progreso
- Próximas lecciones
- Historial de calificaciones

### Dashboard de Instructores
- Total de cursos creados
- Total de estudiantes
- Lista de cursos con estadísticas
- Estudiantes por curso
- Calificaciones promedio

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ Tokens JWT seguros con NextAuth.js
- ✅ Protección CSRF integrada
- ✅ Validación de datos en servidor
- ✅ Sanitización de inputs
- ✅ Protección de rutas por rol
- ✅ Variables de entorno para secrets
- ✅ HTTPS ready en producción

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
yarn test

# Tests en modo watch
yarn test:watch

# Coverage
yarn test:coverage
```

## 📊 Monitoreo y Analytics

Para producción, recomendamos integrar:
- **Vercel Analytics** para métricas de rendimiento
- **Sentry** para error tracking
- **PostHog** o **Mixpanel** para analytics de usuarios

## 🔄 Roadmap Futuro

- [ ] Sistema de certificados al completar cursos
- [ ] Chat en vivo entre instructor-estudiante
- [ ] Foros de discusión por curso
- [ ] Sistema de calificaciones y reviews
- [ ] Notificaciones por email
- [ ] Exportar progreso a PDF
- [ ] Dark mode completo
- [ ] Aplicación móvil (React Native)
- [ ] Integración con Zoom para clases en vivo
- [ ] Sistema de badges y gamificación

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Guías de contribución
- Seguir el estilo de código existente
- Agregar tests para nuevas funcionalidades
- Actualizar la documentación
- Hacer commits descriptivos

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**David Cáceres**
- GitHub: [@davidacaceres](https://github.com/davidacaceres)
- Repositorio: [contenedor_cursos](https://github.com/davidacaceres/contenedor_cursos)

## 📧 Soporte y Contacto

- **Issues**: Para reportar bugs o solicitar features, usa [GitHub Issues](https://github.com/davidacaceres/contenedor_cursos/issues)
- **Discusiones**: Para preguntas generales, usa [GitHub Discussions](https://github.com/davidacaceres/contenedor_cursos/discussions)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) por el framework
- [Vercel](https://vercel.com/) por el hosting
- [Prisma](https://www.prisma.io/) por el ORM
- [shadcn/ui](https://ui.shadcn.com/) por los componentes
- [Tailwind CSS](https://tailwindcss.com/) por los estilos

---

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!**

**🎓 ¡Feliz aprendizaje y enseñanza! 📚**
