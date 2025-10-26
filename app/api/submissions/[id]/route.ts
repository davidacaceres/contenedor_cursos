
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener envío específico
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                title: true,
                instructorId: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Envío no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const isOwner = submission.userId === session.user.id;
    const isInstructor =
      session.user.role === 'INSTRUCTOR' &&
      submission.assignment.course.instructorId === session.user.id;

    if (!isOwner && !isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error al obtener envío:', error);
    return NextResponse.json(
      { error: 'Error al obtener envío' },
      { status: 500 }
    );
  }
}

// PATCH - Calificar envío (solo instructores)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { score, feedback } = body;

    // Obtener el envío
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Envío no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el instructor es dueño del curso
    if (submission.assignment.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Validar score
    if (score !== undefined) {
      if (score < 0 || score > submission.assignment.maxScore) {
        return NextResponse.json(
          { error: `La calificación debe estar entre 0 y ${submission.assignment.maxScore}` },
          { status: 400 }
        );
      }
    }

    // Actualizar envío
    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        ...(score !== undefined && { score }),
        ...(feedback !== undefined && { feedback }),
        status: 'GRADED',
        gradedAt: new Date(),
      },
      include: {
        assignment: {
          select: {
            title: true,
            maxScore: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al calificar envío:', error);
    return NextResponse.json(
      { error: 'Error al calificar envío' },
      { status: 500 }
    );
  }
}
