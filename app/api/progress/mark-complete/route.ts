
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/progress/mark-complete - Marcar una lección como completada
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId } = body;

    // Verificar que el estudiante está inscrito en el curso
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
    }

    // Crear o actualizar el progreso
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: lessonId
        }
      },
      create: {
        userId: session.user.id,
        lessonId: lessonId,
        completed: true,
        completedAt: new Date()
      },
      update: {
        completed: true,
        completedAt: new Date()
      }
    });

    // Verificar si el curso está completo
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId }
    });

    const completedLessons = await prisma.progress.count({
      where: {
        userId: session.user.id,
        lesson: { courseId: lesson.courseId },
        completed: true
      }
    });

    // Si todas las lecciones están completadas, marcar el curso como completo y crear notificación
    if (totalLessons === completedLessons && !enrollment.completedAt) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { completedAt: new Date() }
      });

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'COURSE_COMPLETED',
          title: '¡Curso completado!',
          message: `¡Felicitaciones! Has completado el curso "${lesson.course.title}"`,
          relatedId: lesson.courseId,
          link: `/student/courses/${lesson.courseId}`
        }
      });
    }

    return NextResponse.json({
      progress,
      courseProgress: {
        totalLessons,
        completedLessons,
        percentage: Math.round((completedLessons / totalLessons) * 100)
      }
    });
  } catch (error) {
    console.error('Error al marcar lección como completada:', error);
    return NextResponse.json({ error: 'Error al actualizar progreso' }, { status: 500 });
  }
}
