
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { title, description, thumbnail, instructorId } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      );
    }

    if (instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Crear el curso en estado DRAFT por defecto
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        instructorId,
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
      message: 'Curso creado exitosamente',
      course,
    });

  } catch (error) {
    console.error('Error creando curso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
