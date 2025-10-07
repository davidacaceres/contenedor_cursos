
# 🎓 Plataforma de Cursos en Línea

Una plataforma completa de gestión de cursos en línea que permite a instructores crear y gestionar cursos, y a estudiantes inscribirse y aprender a través de contenido interactivo.

## 🌟 Características Principales

### Para Instructores 👨‍🏫
- **Gestión de cursos**: Crear, editar y administrar cursos
- **Contenido multimedia**: Agregar lecciones con:
  - Videos (YouTube/Vimeo)
  - Documentos PDF
  - Contenido de texto enriquecido
- **Evaluaciones**: Crear cuestionarios de opción múltiple con calificación automática
- **Seguimiento**: Ver estudiantes inscritos, su progreso y calificaciones
- **Dashboard**: Panel de control intuitivo para gestionar todo el contenido

### Para Estudiantes 👨‍🎓
- **Catálogo de cursos**: Explorar todos los cursos disponibles
- **Inscripción fácil**: Inscribirse a cursos con un solo clic
- **Aprendizaje interactivo**: Acceder a lecciones multimedia
- **Evaluaciones**: Realizar cuestionarios con retroalimentación inmediata
- **Seguimiento de progreso**: Ver avance en cada curso
- **Dashboard personal**: Panel con todos los cursos inscritos y estadísticas

## 🚀 Tecnologías Utilizadas

- **Framework**: Next.js 14 con App Router
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Estilos**: Tailwind CSS
- **Componentes UI**: Radix UI + shadcn/ui
- **Almacenamiento**: AWS S3 para archivos
- **Lenguaje**: TypeScript

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL
- Cuenta de AWS (para almacenamiento de archivos)

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/davidacaceres/contenedor_cursos.git
cd contenedor_cursos
```

2. **Instalar dependencias**
```bash
yarn install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_db"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3 (opcional, para subir archivos)
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=tu-bucket
AWS_FOLDER_PREFIX=carpeta/
```

4. **Configurar la base de datos**
```bash
# Generar cliente de Prisma
yarn prisma generate

# Ejecutar migraciones
yarn prisma migrate dev

# Poblar con datos de prueba
yarn prisma db seed
```

5. **Iniciar el servidor de desarrollo**
```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👤 Credenciales de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

### Instructores
- **Email**: maria.garcia@instructor.com | **Contraseña**: password123
- **Email**: carlos.rodriguez@instructor.com | **Contraseña**: password123

### Estudiantes
- **Email**: ana.lopez@student.com | **Contraseña**: password123
- **Email**: pedro.martinez@student.com | **Contraseña**: password123
- **Email**: laura.sanchez@student.com | **Contraseña**: password123

## 📁 Estructura del Proyecto

```
plataforma_cursos_online/
├── app/                    # Rutas y páginas de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard de estudiantes
│   ├── instructor/        # Panel de instructores
│   └── courses/           # Páginas de cursos
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes de UI base
│   └── ...               # Componentes específicos
├── lib/                   # Utilidades y configuraciones
│   ├── auth.ts           # Configuración de NextAuth
│   ├── db.ts             # Cliente de Prisma
│   └── aws-config.ts     # Configuración de AWS
├── prisma/               # Esquema de base de datos
│   └── schema.prisma
├── scripts/              # Scripts de utilidad
│   └── seed.ts           # Datos de prueba
└── types/                # Tipos de TypeScript
```

## 🗄️ Modelo de Base de Datos

- **User**: Usuarios con roles (INSTRUCTOR/STUDENT)
- **Course**: Cursos creados por instructores
- **Lesson**: Lecciones (VIDEO/PDF/TEXT) dentro de cursos
- **Quiz**: Cuestionarios asociados a lecciones
- **Question**: Preguntas de opción múltiple
- **Enrollment**: Inscripciones de estudiantes a cursos
- **Progress**: Seguimiento de lecciones completadas
- **QuizResult**: Resultados de cuestionarios

## 🎯 Funcionalidades Detalladas

### Gestión de Cursos
- Crear cursos con título, descripción e imagen
- Organizar lecciones en orden secuencial
- Editar y eliminar contenido

### Sistema de Lecciones
- **Lecciones de Video**: Integración con YouTube/Vimeo
- **Lecciones PDF**: Subida y visualización de documentos
- **Lecciones de Texto**: Editor de contenido enriquecido con Markdown

### Evaluaciones
- Crear cuestionarios con múltiples preguntas
- Opciones múltiples (A, B, C, D)
- Calificación automática
- Historial de intentos y calificaciones

### Seguimiento y Reportes
- Progreso por curso (porcentaje completado)
- Calificaciones de cuestionarios
- Lista de estudiantes por curso
- Estadísticas de rendimiento

## 🔒 Seguridad

- Autenticación con NextAuth.js
- Contraseñas hasheadas con bcrypt
- Protección de rutas por roles
- Validación de datos en servidor

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio en Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros servicios
Compatible con cualquier plataforma que soporte Next.js:
- Railway
- Render
- AWS
- DigitalOcean

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

David Cáceres

## 📧 Contacto

Para preguntas o sugerencias, por favor abre un issue en GitHub.

---

**¡Feliz aprendizaje! 🎓📚**
