
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...');
  await prisma.quizResult.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashear contraseñas
  const hashedPassword = await bcrypt.hash('password123', 12);
  const johnPassword = await bcrypt.hash('johndoe123', 12);

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...');
  
  // Usuario admin por defecto (oculto del usuario)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'john@doe.com',
      password: johnPassword,
      role: 'INSTRUCTOR',
    }
  });

  // Instructores
  const instructor1 = await prisma.user.create({
    data: {
      name: 'Dr. María García',
      email: 'maria.garcia@instructor.com',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Prof. Carlos Rodríguez',
      email: 'carlos.rodriguez@instructor.com',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    }
  });

  // Estudiantes
  const student1 = await prisma.user.create({
    data: {
      name: 'Ana López',
      email: 'ana.lopez@student.com',
      password: hashedPassword,
      role: 'STUDENT',
    }
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Pedro Martínez',
      email: 'pedro.martinez@student.com',
      password: hashedPassword,
      role: 'STUDENT',
    }
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Laura Sánchez',
      email: 'laura.sanchez@student.com',
      password: hashedPassword,
      role: 'STUDENT',
    }
  });

  // Crear cursos
  console.log('📚 Creando cursos de prueba...');
  
  const course1 = await prisma.course.create({
    data: {
      title: 'Introducción a la Programación Web',
      description: 'Aprende los fundamentos del desarrollo web moderno con HTML, CSS y JavaScript. Este curso está diseñado para principiantes que quieren construir sus primeras páginas web interactivas.',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop',
      instructorId: instructor1.id,
    }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Diseño UX/UI Avanzado',
      description: 'Domina los principios del diseño de experiencia de usuario y interfaces. Incluye teoría del color, tipografía, prototipado y herramientas profesionales como Figma.',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&h=300&fit=crop',
      instructorId: instructor2.id,
    }
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Marketing Digital Completo',
      description: 'Estrategias modernas de marketing digital, SEO, SEM, redes sociales y análisis de datos. Perfecto para emprendedores y profesionales del marketing.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop',
      instructorId: instructor1.id,
    }
  });

  // Crear lecciones para el curso 1
  console.log('📖 Creando lecciones...');
  
  const lesson1_1 = await prisma.lesson.create({
    data: {
      title: 'Introducción al HTML',
      content: '# Introducción al HTML\n\nHTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web.\n\n## ¿Qué es HTML?\n\nHTML describe la estructura de una página web usando elementos. Los elementos HTML están representados por etiquetas.\n\n### Estructura básica:\n\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Mi primera página</title>\n</head>\n<body>\n    <h1>Hola Mundo</h1>\n    <p>Este es mi primer párrafo.</p>\n</body>\n</html>\n```\n\n## Elementos importantes:\n\n- `<h1>` a `<h6>`: Encabezados\n- `<p>`: Párrafos\n- `<div>`: Contenedores\n- `<img>`: Imágenes\n- `<a>`: Enlaces',
      type: 'TEXT',
      courseId: course1.id,
      order: 1,
      duration: 45,
    }
  });

  const lesson1_2 = await prisma.lesson.create({
    data: {
      title: 'Fundamentos de CSS',
      content: '# Fundamentos de CSS\n\nCSS (Cascading Style Sheets) es utilizado para describir la presentación de un documento escrito en HTML.\n\n## Selectores básicos\n\n### Selector de elemento\n```css\nh1 {\n    color: blue;\n    font-size: 24px;\n}\n```\n\n### Selector de clase\n```css\n.mi-clase {\n    background-color: yellow;\n    padding: 10px;\n}\n```\n\n### Selector de ID\n```css\n#mi-id {\n    text-align: center;\n    margin: 20px;\n}\n```\n\n## Propiedades importantes:\n\n- `color`: Color del texto\n- `background-color`: Color de fondo\n- `font-size`: Tamaño de fuente\n- `margin`: Margen exterior\n- `padding`: Espacio interior\n- `border`: Bordes',
      type: 'TEXT',
      courseId: course1.id,
      order: 2,
      duration: 60,
    }
  });

  const lesson1_3 = await prisma.lesson.create({
    data: {
      title: 'Tutorial: Creando tu primera página web',
      videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      type: 'VIDEO',
      courseId: course1.id,
      order: 3,
      duration: 30,
    }
  });

  const lesson1_4 = await prisma.lesson.create({
    data: {
      title: 'Guía de referencia HTML/CSS',
      pdfUrl: 'https://www.w3.org/Style/CSS/learning',
      type: 'PDF',
      courseId: course1.id,
      order: 4,
      duration: 15,
    }
  });

  // Crear lecciones para el curso 2
  const lesson2_1 = await prisma.lesson.create({
    data: {
      title: 'Principios del Diseño UX',
      content: '# Principios del Diseño UX\n\nLa experiencia de usuario (UX) se centra en crear productos útiles, utilizables y deseables.\n\n## Los 5 principios fundamentales:\n\n### 1. Usabilidad\n- Facilidad de uso\n- Navegación intuitiva\n- Consistencia en la interfaz\n\n### 2. Utilidad\n- El producto debe resolver un problema real\n- Funcionalidades relevantes\n- Valor añadido para el usuario\n\n### 3. Deseabilidad\n- Atractivo visual\n- Experiencia emocional positiva\n- Marca coherente\n\n### 4. Encontrabilidad\n- Arquitectura de información clara\n- Navegación lógica\n- Búsqueda eficiente\n\n### 5. Accesibilidad\n- Diseño inclusivo\n- Compatibilidad con tecnologías asistivas\n- Contraste adecuado\n\n## Proceso de diseño UX:\n\n1. **Investigación** - Entender al usuario\n2. **Ideación** - Generar soluciones\n3. **Prototipado** - Crear versiones de prueba\n4. **Testing** - Validar con usuarios reales\n5. **Iteración** - Mejorar basado en feedback',
      type: 'TEXT',
      courseId: course2.id,
      order: 1,
      duration: 50,
    }
  });

  const lesson2_2 = await prisma.lesson.create({
    data: {
      title: 'Herramientas de prototipado en Figma',
      videoUrl: 'https://www.youtube.com/watch?v=FTlVstm_aZU',
      type: 'VIDEO',
      courseId: course2.id,
      order: 2,
      duration: 45,
    }
  });

  // Crear cuestionarios
  console.log('❓ Creando cuestionarios...');
  
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Evaluación: Fundamentos de HTML',
      lessonId: lesson1_1.id,
    }
  });

  // Preguntas para el quiz 1
  await prisma.question.create({
    data: {
      text: '¿Qué significa HTML?',
      optionA: 'High Text Markup Language',
      optionB: 'HyperText Markup Language',
      optionC: 'Home Tool Markup Language',
      optionD: 'Hyperlink and Text Markup Language',
      correctOption: 'B',
      quizId: quiz1.id,
      order: 1,
    }
  });

  await prisma.question.create({
    data: {
      text: '¿Cuál es la etiqueta correcta para crear un enlace?',
      optionA: '<link>',
      optionB: '<url>',
      optionC: '<a>',
      optionD: '<href>',
      correctOption: 'C',
      quizId: quiz1.id,
      order: 2,
    }
  });

  await prisma.question.create({
    data: {
      text: '¿Qué etiqueta se usa para el encabezado principal de una página?',
      optionA: '<header>',
      optionB: '<h1>',
      optionC: '<title>',
      optionD: '<main>',
      correctOption: 'B',
      quizId: quiz1.id,
      order: 3,
    }
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      title: 'Evaluación: Fundamentos de CSS',
      lessonId: lesson1_2.id,
    }
  });

  await prisma.question.create({
    data: {
      text: '¿Qué significa CSS?',
      optionA: 'Computer Style Sheets',
      optionB: 'Creative Style Sheets',
      optionC: 'Cascading Style Sheets',
      optionD: 'Colorful Style Sheets',
      correctOption: 'C',
      quizId: quiz2.id,
      order: 1,
    }
  });

  await prisma.question.create({
    data: {
      text: '¿Cómo se selecciona un elemento por su clase en CSS?',
      optionA: '#nombre-clase',
      optionB: '.nombre-clase',
      optionC: 'nombre-clase',
      optionD: 'class:nombre-clase',
      correctOption: 'B',
      quizId: quiz2.id,
      order: 2,
    }
  });

  // Quiz para UX
  const quiz3 = await prisma.quiz.create({
    data: {
      title: 'Evaluación: Principios UX',
      lessonId: lesson2_1.id,
    }
  });

  await prisma.question.create({
    data: {
      text: '¿Cuál NO es uno de los 5 principios fundamentales del UX?',
      optionA: 'Usabilidad',
      optionB: 'Utilidad',
      optionC: 'Velocidad',
      optionD: 'Accesibilidad',
      correctOption: 'C',
      quizId: quiz3.id,
      order: 1,
    }
  });

  // Crear inscripciones
  console.log('✍️ Creando inscripciones...');
  
  const enrollments = [
    { userId: student1.id, courseId: course1.id },
    { userId: student1.id, courseId: course2.id },
    { userId: student2.id, courseId: course1.id },
    { userId: student2.id, courseId: course3.id },
    { userId: student3.id, courseId: course2.id },
  ];

  for (const enrollment of enrollments) {
    await prisma.enrollment.create({
      data: enrollment
    });
  }

  // Crear progreso
  console.log('📊 Creando progreso...');
  
  // Ana López ha completado algunas lecciones del curso 1
  await prisma.progress.create({
    data: {
      userId: student1.id,
      lessonId: lesson1_1.id,
      completed: true,
      completedAt: new Date(),
    }
  });

  await prisma.progress.create({
    data: {
      userId: student1.id,
      lessonId: lesson1_2.id,
      completed: true,
      completedAt: new Date(),
    }
  });

  // Pedro Martínez ha completado la primera lección
  await prisma.progress.create({
    data: {
      userId: student2.id,
      lessonId: lesson1_1.id,
      completed: true,
      completedAt: new Date(),
    }
  });

  // Crear resultados de quiz
  console.log('🎯 Creando resultados de cuestionarios...');
  
  // Ana López - Quiz 1 (HTML)
  await prisma.quizResult.create({
    data: {
      userId: student1.id,
      quizId: quiz1.id,
      score: 85,
      answers: {
        '1': 'B',
        '2': 'C',
        '3': 'A'
      }
    }
  });

  // Ana López - Quiz 2 (CSS)
  await prisma.quizResult.create({
    data: {
      userId: student1.id,
      quizId: quiz2.id,
      score: 90,
      answers: {
        '1': 'C',
        '2': 'B'
      }
    }
  });

  // Pedro Martínez - Quiz 1 (HTML)
  await prisma.quizResult.create({
    data: {
      userId: student2.id,
      quizId: quiz1.id,
      score: 75,
      answers: {
        '1': 'B',
        '2': 'C',
        '3': 'B'
      }
    }
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n🎓 Datos creados:');
  console.log('- 6 usuarios (3 instructores, 3 estudiantes)');
  console.log('- 3 cursos');
  console.log('- 6 lecciones (texto, video, PDF)');
  console.log('- 3 cuestionarios');
  console.log('- 7 preguntas');
  console.log('- 5 inscripciones');
  console.log('- Progreso y calificaciones de ejemplo');
  console.log('\n👨‍🎓 Credenciales de prueba:');
  console.log('Instructores:');
  console.log('- maria.garcia@instructor.com / password123');
  console.log('- carlos.rodriguez@instructor.com / password123');
  console.log('Estudiantes:');
  console.log('- ana.lopez@student.com / password123');
  console.log('- pedro.martinez@student.com / password123');
  console.log('- laura.sanchez@student.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
