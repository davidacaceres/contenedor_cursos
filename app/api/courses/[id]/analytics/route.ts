
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
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

    // Verificar que el curso pertenece al instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        lessons: true,
        modules: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver las analíticas de este curso' },
        { status: 403 }
      );
    }

    // 1. Obtener inscripciones totales y por fecha
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    });

    // 2. Obtener certificados emitidos
    const certificates = await prisma.certificate.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. Obtener progreso de lecciones por estudiante
    const progressData = await prisma.progress.findMany({
      where: {
        lesson: {
          courseId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        lesson: true,
      },
    });

    // 4. Obtener resultados de quizzes
    const quizResults = await prisma.quizResult.findMany({
      where: {
        quiz: {
          lesson: {
            courseId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        quiz: {
          include: {
            lesson: true,
          },
        },
      },
    });

    // 5. Obtener envíos de tareas
    const submissions = await prisma.submission.findMany({
      where: {
        assignment: {
          courseId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            maxScore: true,
          },
        },
      },
    });

    // 6. Obtener comentarios
    const comments = await prisma.comment.findMany({
      where: {
        submission: {
          assignment: {
            courseId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Calcular métricas agregadas

    // Total de inscripciones
    const totalEnrollments = enrollments.length;

    // Tasa de finalización
    const completionRate = totalEnrollments > 0 
      ? ((certificates.length / totalEnrollments) * 100).toFixed(1)
      : '0';

    // Progreso promedio por estudiante
    const totalLessons = course.lessons.length;
    const studentProgress = new Map<string, number>();
    
    progressData.forEach((progress) => {
      if (progress.completed) {
        const current = studentProgress.get(progress.userId) || 0;
        studentProgress.set(progress.userId, current + 1);
      }
    });

    const averageProgress = totalEnrollments > 0 && totalLessons > 0
      ? Array.from(studentProgress.values()).reduce((sum, val) => sum + (val / totalLessons * 100), 0) / totalEnrollments
      : 0;

    // Calificación promedio en quizzes
    const averageQuizScore = quizResults.length > 0
      ? quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length
      : 0;

    // Calificación promedio en assignments
    const gradedSubmissions = submissions.filter(s => s.score !== null);
    const averageAssignmentScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length
      : 0;

    // Inscripciones por mes (últimos 6 meses)
    const enrollmentsByMonth: { [key: string]: number } = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    enrollments.forEach((enrollment) => {
      const enrollDate = new Date(enrollment.enrolledAt);
      if (enrollDate >= sixMonthsAgo) {
        const monthKey = `${enrollDate.getFullYear()}-${String(enrollDate.getMonth() + 1).padStart(2, '0')}`;
        enrollmentsByMonth[monthKey] = (enrollmentsByMonth[monthKey] || 0) + 1;
      }
    });

    // Distribución de calificaciones en quizzes
    const quizScoreDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    quizResults.forEach((result) => {
      if (result.score <= 20) quizScoreDistribution['0-20']++;
      else if (result.score <= 40) quizScoreDistribution['21-40']++;
      else if (result.score <= 60) quizScoreDistribution['41-60']++;
      else if (result.score <= 80) quizScoreDistribution['61-80']++;
      else quizScoreDistribution['81-100']++;
    });

    // Top estudiantes por progreso
    const topStudents = Array.from(studentProgress.entries())
      .map(([userId, lessonsCompleted]) => {
        const enrollment = enrollments.find(e => e.user.id === userId);
        return {
          userId,
          name: enrollment?.user.name || 'Desconocido',
          email: enrollment?.user.email || '',
          lessonsCompleted,
          progressPercentage: totalLessons > 0 ? ((lessonsCompleted / totalLessons) * 100).toFixed(1) : '0',
          hasCertificate: certificates.some(c => c.userId === userId),
        };
      })
      .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)
      .slice(0, 10);

    // Actividad reciente
    const recentActivity = [
      ...enrollments.slice(-5).map(e => ({
        type: 'enrollment',
        date: e.enrolledAt,
        description: `${e.user.name} se inscribió en el curso`,
      })),
      ...certificates.slice(-5).map(c => ({
        type: 'certificate',
        date: c.issuedAt,
        description: `${c.user.name} completó el curso y recibió su certificado`,
      })),
      ...submissions.filter(s => s.submittedAt).slice(-5).map(s => ({
        type: 'submission',
        date: s.submittedAt!,
        description: `${s.user.name} envió ${s.assignment.title}`,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Engagement por semana (últimas 8 semanas)
    const weeklyEngagement: { [key: string]: { submissions: number; comments: number; progress: number } } = {};
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

    submissions.forEach((submission) => {
      if (submission.submittedAt && new Date(submission.submittedAt) >= eightWeeksAgo) {
        const weekKey = getWeekKey(new Date(submission.submittedAt));
        if (!weeklyEngagement[weekKey]) weeklyEngagement[weekKey] = { submissions: 0, comments: 0, progress: 0 };
        weeklyEngagement[weekKey].submissions++;
      }
    });

    comments.forEach((comment) => {
      if (new Date(comment.createdAt) >= eightWeeksAgo) {
        const weekKey = getWeekKey(new Date(comment.createdAt));
        if (!weeklyEngagement[weekKey]) weeklyEngagement[weekKey] = { submissions: 0, comments: 0, progress: 0 };
        weeklyEngagement[weekKey].comments++;
      }
    });

    progressData.forEach((progress) => {
      if (progress.completedAt && new Date(progress.completedAt) >= eightWeeksAgo) {
        const weekKey = getWeekKey(new Date(progress.completedAt));
        if (!weeklyEngagement[weekKey]) weeklyEngagement[weekKey] = { submissions: 0, comments: 0, progress: 0 };
        weeklyEngagement[weekKey].progress++;
      }
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        totalLessons: course.lessons.length,
        totalModules: course.modules.length,
      },
      overview: {
        totalEnrollments,
        totalCertificates: certificates.length,
        completionRate: parseFloat(completionRate),
        averageProgress: averageProgress.toFixed(1),
        averageQuizScore: averageQuizScore.toFixed(1),
        averageAssignmentScore: averageAssignmentScore.toFixed(1),
        totalSubmissions: submissions.length,
        totalComments: comments.length,
      },
      enrollmentsByMonth,
      quizScoreDistribution,
      topStudents,
      recentActivity,
      weeklyEngagement,
    });
  } catch (error) {
    console.error('Error al obtener analíticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener analíticas' },
      { status: 500 }
    );
  }
}

// Helper function to get week key
function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}
