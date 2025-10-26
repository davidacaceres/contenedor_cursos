
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/progress/course/[courseId] - Obtener el progreso de un curso
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.courseId
        }
      }
    });

    if (!enrollment && session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'No estás inscrito en este curso' }, { status: 403 });
    }

    // Obtener todas las lecciones del curso
    const lessons = await prisma.lesson.findMany({
      where: { courseId: params.courseId },
      include: {
        progress: {
          where: { userId: session.user.id }
        }
      },
      orderBy: { order: 'asc' }
    });

    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((l: any) => l.progress[0]?.completed).length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return NextResponse.json({
      totalLessons,
      completedLessons,
      percentage,
      lessons: lessons.map((l: any) => ({
        id: l.id,
        title: l.title,
        completed: l.progress[0]?.completed || false,
        completedAt: l.progress[0]?.completedAt || null
      }))
    });
  } catch (error) {
    console.error('Error al obtener progreso del curso:', error);
    return NextResponse.json({ error: 'Error al obtener progreso' }, { status: 500 });
  }
}
