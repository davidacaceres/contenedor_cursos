
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID de curso requerido' },
        { status: 400 }
      );
    }

    // Verificar si el curso existe y está publicado
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        isPublished: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado o no disponible' },
        { status: 404 }
      );
    }

    // Verificar si ya está inscrito
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este curso' },
        { status: 400 }
      );
    }

    // Crear la inscripción
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Inscripción exitosa',
      enrollment,
    });

  } catch (error) {
    console.error('Error en inscripción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
