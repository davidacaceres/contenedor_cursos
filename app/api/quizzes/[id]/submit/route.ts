
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/quizzes/[id]/submit - Enviar respuestas de un quiz
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { answers } = body; // { questionId: 'A' | 'B' | 'C' | 'D' }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
        lesson: {
          include: { course: true }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });
    }

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: quiz.lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
    }

    // Verificar el límite de intentos
    if (quiz.maxAttempts) {
      const attemptCount = await prisma.quizResult.count({
        where: {
          userId: session.user.id,
          quizId: params.id
        }
      });

      if (attemptCount >= quiz.maxAttempts) {
        return NextResponse.json({ error: 'Has alcanzado el límite de intentos para este quiz' }, { status: 400 });
      }
    }

    // Calcular el puntaje
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question: any) => {
      if (answers[question.id] === question.correctOption) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Guardar el resultado
    const result = await prisma.quizResult.create({
      data: {
        userId: session.user.id,
        quizId: params.id,
        score,
        answers
      }
    });

    // Crear notificación
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'QUIZ_GRADED',
        title: passed ? '¡Quiz aprobado!' : 'Quiz completado',
        message: `Has obtenido ${score}% en el quiz "${quiz.title}". ${passed ? '¡Felicitaciones!' : `Necesitas ${quiz.passingScore}% para aprobar.`}`,
        relatedId: quiz.lessonId,
        link: `/student/courses/${quiz.lesson.courseId}`
      }
    });

    return NextResponse.json({
      result,
      score,
      passed,
      correctCount,
      totalQuestions
    });
  } catch (error) {
    console.error('Error al enviar quiz:', error);
    return NextResponse.json({ error: 'Error al enviar quiz' }, { status: 500 });
  }
}
