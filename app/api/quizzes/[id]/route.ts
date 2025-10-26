
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/quizzes/[id] - Obtener un quiz específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          // No incluir la respuesta correcta si es estudiante
          select: session.user.role === 'INSTRUCTOR' ? undefined : {
            id: true,
            text: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            order: true,
            correctOption: false
          }
        },
        lesson: {
          include: { course: true }
        },
        results: session.user.role === 'STUDENT' ? {
          where: { userId: session.user.id },
          orderBy: { completedAt: 'desc' }
        } : true
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error al obtener quiz:', error);
    return NextResponse.json({ error: 'Error al obtener quiz' }, { status: 500 });
  }
}

// PUT /api/quizzes/[id] - Actualizar un quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
          include: { course: true }
        }
      }
    });

    if (!quiz || quiz.lesson.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, timeLimit, maxAttempts, passingScore } = body;

    const updatedQuiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title,
        description,
        timeLimit,
        maxAttempts,
        passingScore
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error('Error al actualizar quiz:', error);
    return NextResponse.json({ error: 'Error al actualizar quiz' }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id] - Eliminar un quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        lesson: {
          include: { course: true }
        }
      }
    });

    if (!quiz || quiz.lesson.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.quiz.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Quiz eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar quiz:', error);
    return NextResponse.json({ error: 'Error al eliminar quiz' }, { status: 500 });
  }
}
