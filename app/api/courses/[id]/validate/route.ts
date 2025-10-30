
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Validar que el curso cumpla con los requisitos para publicarse
export async function GET(
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
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
        lessons: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para ver este curso' },
        { status: 403 }
      );
    }

    // Validaciones
    const validations = {
      hasTitle: course.title && course.title.trim().length > 0,
      hasDescription: course.description && course.description.trim().length > 0,
      hasThumbnail: !!course.thumbnail,
      hasModules: course.modules.length > 0,
      hasLessons: course.lessons.length > 0,
    };

    const isValid = Object.values(validations).every(v => v);

    const issues = [];
    if (!validations.hasTitle) issues.push('Falta el título del curso');
    if (!validations.hasDescription) issues.push('Falta la descripción del curso');
    if (!validations.hasThumbnail) issues.push('Se recomienda agregar una imagen de portada');
    if (!validations.hasModules) issues.push('El curso debe tener al menos un módulo');
    if (!validations.hasLessons) issues.push('El curso debe tener al menos una lección');

    return NextResponse.json({
      isValid,
      validations,
      issues,
      course: {
        id: course.id,
        title: course.title,
        status: course.status,
        modulesCount: course.modules.length,
        lessonsCount: course.lessons.length,
      },
    });
  } catch (error) {
    console.error('Error validando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
