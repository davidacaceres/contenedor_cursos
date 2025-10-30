
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Archivar curso
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
        { error: 'No autorizado para archivar este curso' },
        { status: 403 }
      );
    }

    // Archivar el curso
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: 'ARCHIVED',
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
      message: 'Curso archivado exitosamente',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error archivando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Desarchivar curso (volver a DRAFT)
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

    // Desarchivar el curso
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
      message: 'Curso desarchivado exitosamente',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error desarchivando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
