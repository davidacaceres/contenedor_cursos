
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/quizzes?lessonId=xxx - Listar quizzes de una lección
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId es requerido' }, { status: 400 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        results: session.user.role === 'STUDENT' ? {
          where: { userId: session.user.id },
          orderBy: { completedAt: 'desc' }
        } : false
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error al obtener quizzes:', error);
    return NextResponse.json({ error: 'Error al obtener quizzes' }, { status: 500 });
  }
}

// POST /api/quizzes - Crear un nuevo quiz
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, title, description, timeLimit, maxAttempts, passingScore, questions } = body;

    // Verificar que el instructor es dueño del curso
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson || lesson.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title,
        description,
        timeLimit,
        maxAttempts,
        passingScore: passingScore || 70,
        questions: {
          create: questions.map((q: any, index: number) => ({
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            order: index + 1
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error('Error al crear quiz:', error);
    return NextResponse.json({ error: 'Error al crear quiz' }, { status: 500 });
  }
}
