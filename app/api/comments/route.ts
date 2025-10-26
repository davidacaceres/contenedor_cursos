
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/comments?submissionId=xxx - Listar comentarios de un envío
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId es requerido' }, { status: 400 });
    }

    // Verificar que el usuario tiene acceso al envío
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario es el estudiante dueño del envío o el instructor del curso
    const isOwner = submission.userId === session.user.id;
    const isInstructor = submission.assignment.course.instructorId === session.user.id;

    if (!isOwner && !isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      where: { submissionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json({ error: 'Error al obtener comentarios' }, { status: 500 });
  }
}

// POST /api/comments - Crear un nuevo comentario
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, content } = body;

    // Verificar que el usuario tiene acceso al envío
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true }
        },
        user: true
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Envío no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario es el estudiante dueño del envío o el instructor del curso
    const isOwner = submission.userId === session.user.id;
    const isInstructor = submission.assignment.course.instructorId === session.user.id;

    if (!isOwner && !isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        submissionId,
        userId: session.user.id,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      }
    });

    // Crear notificación para el otro usuario
    const recipientId = isInstructor ? submission.userId : submission.assignment.course.instructorId;
    
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'COMMENT_ADDED',
        title: 'Nuevo comentario',
        message: `${session.user.name || 'Alguien'} ha comentado en tu envío de "${submission.assignment.title}"`,
        relatedId: submissionId,
        link: `/student/assignments/${submission.assignmentId}`
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json({ error: 'Error al crear comentario' }, { status: 500 });
  }
}
