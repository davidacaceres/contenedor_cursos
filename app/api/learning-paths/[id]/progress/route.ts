
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/learning-paths/[id]/progress - Get student progress in a learning path
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión' },
        { status: 401 }
      );
    }

    // Check enrollment
    const enrollment = await prisma.learningPathEnrollment.findUnique({
      where: {
        userId_learningPathId: {
          userId: session.user.id,
          learningPathId: params.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en esta ruta de aprendizaje' },
        { status: 404 }
      );
    }

    // Get learning path with courses
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
      include: {
        courses: {
          include: {
            course: {
              include: {
                lessons: true,
                _count: {
                  select: {
                    lessons: true,
                  },
                },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Ruta de aprendizaje no encontrada' },
        { status: 404 }
      );
    }

    // Calculate progress for each course
    const coursesProgress = await Promise.all(
      learningPath.courses.map(async (lpc) => {
        const course = lpc.course;
        
        // Get user's course enrollment
        const courseEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: course.id,
            },
          },
        });

        // Get all lessons for this course
        const totalLessons = course.lessons.length;

        // Get completed lessons
        const completedLessons = await prisma.progress.count({
          where: {
            userId: session.user.id,
            lessonId: {
              in: course.lessons.map(l => l.id),
            },
            completed: true,
          },
        });

        const progressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          order: lpc.order,
          isRequired: lpc.isRequired,
          isEnrolled: !!courseEnrollment,
          isCompleted: courseEnrollment?.completedAt !== null,
          totalLessons,
          completedLessons,
          progressPercentage,
        };
      })
    );

    // Calculate overall progress
    const totalCourses = learningPath.courses.length;
    const completedCourses = coursesProgress.filter(c => c.isCompleted).length;
    const overallProgress = totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

    // Check if all required courses are completed
    const allRequiredCompleted = coursesProgress
      .filter(c => c.isRequired)
      .every(c => c.isCompleted);

    // Issue certificate if all required courses are completed and not already completed
    if (allRequiredCompleted && !enrollment.completedAt) {
      // Update enrollment as completed
      await prisma.learningPathEnrollment.update({
        where: {
          userId_learningPathId: {
            userId: session.user.id,
            learningPathId: params.id,
          },
        },
        data: {
          completedAt: new Date(),
        },
      });

      // Check if certificate already exists
      const existingCertificate = await prisma.learningPathCertificate.findUnique({
        where: {
          userId_learningPathId: {
            userId: session.user.id,
            learningPathId: params.id,
          },
        },
      });

      if (!existingCertificate) {
        // Generate unique certificate code
        const certificateCode = `LP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create certificate
        await prisma.learningPathCertificate.create({
          data: {
            certificateCode,
            userId: session.user.id,
            learningPathId: params.id,
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'COURSE_COMPLETED',
            title: '¡Ruta de Aprendizaje Completada!',
            message: `Has completado la ruta de aprendizaje: ${learningPath.title}. Tu certificado está disponible.`,
            link: `/student/learning-paths/${params.id}/certificate`,
          },
        });
      }
    }

    return NextResponse.json({
      enrollment,
      coursesProgress,
      totalCourses,
      completedCourses,
      overallProgress,
      allRequiredCompleted,
    });
  } catch (error) {
    console.error('Error fetching learning path progress:', error);
    return NextResponse.json(
      { error: 'Error al obtener el progreso' },
      { status: 500 }
    );
  }
}
