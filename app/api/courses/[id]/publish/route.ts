
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validar que el curso tenga el contenido mínimo requerido para publicar
async function validateCourseForPublishing(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: true,
      lessons: true,
    },
  });

  if (!course) {
    return { valid: false, message: 'Curso no encontrado' };
  }

  const errors = [];

  // Validar que tenga descripción y título
  if (!course.title || course.title.trim().length === 0) {
    errors.push('El curso debe tener un título');
  }

  if (!course.description || course.description.trim().length === 0) {
    errors.push('El curso debe tener una descripción');
  }

  // Validar que tenga al menos un módulo
  if (course.modules.length === 0) {
    errors.push('El curso debe tener al menos un módulo');
  }

  // Validar que tenga al menos una lección
  if (course.lessons.length === 0) {
    errors.push('El curso debe tener al menos una lección');
  }

  if (errors.length > 0) {
    return { valid: false, message: errors.join(', ') };
  }

  return { valid: true };
}

// Publicar curso
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Verificar que el curso pertenezca al instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para publicar este curso' },
        { status: 403 }
      );
    }

    // Validar que el curso esté listo para publicar
    const validation = await validateCourseForPublishing(courseId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Publicar el curso
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Curso publicado exitosamente',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error publicando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Despublicar curso (volver a DRAFT)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const courseId = params.id;

    // Verificar que el curso pertenezca al instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para modificar este curso' },
        { status: 403 }
      );
    }

    // Despublicar el curso
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'DRAFT',
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Curso despublicado exitosamente',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error despublicando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
