
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verificar que el curso existe y pertenece al instructor
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado para despublicar este curso' },
        { status: 403 }
      );
    }

    // Despublicar el curso
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: 'DRAFT',
      },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            modules: true,
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Curso despublicado exitosamente. Los estudiantes ya no podrán inscribirse.',
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
