
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/learning-paths/[id]/enroll - Enroll in a learning path
export async function POST(
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

    // Check if learning path exists and is published
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
      include: {
        courses: {
          include: {
            course: true,
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

    if (!learningPath.isPublished) {
      return NextResponse.json(
        { error: 'Esta ruta de aprendizaje no está disponible' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.learningPathEnrollment.findUnique({
      where: {
        userId_learningPathId: {
          userId: session.user.id,
          learningPathId: params.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en esta ruta de aprendizaje' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = await prisma.learningPathEnrollment.create({
      data: {
        userId: session.user.id,
        learningPathId: params.id,
      },
    });

    // Also enroll in all courses in the learning path
    const courseEnrollments = await Promise.all(
      learningPath.courses.map(async (lpc) => {
        // Check if already enrolled in the course
        const existingCourseEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: lpc.courseId,
            },
          },
        });

        if (!existingCourseEnrollment) {
          return prisma.enrollment.create({
            data: {
              userId: session.user.id,
              courseId: lpc.courseId,
            },
          });
        }

        return existingCourseEnrollment;
      })
    );

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'NEW_ENROLLMENT',
        title: 'Inscripción en Ruta de Aprendizaje',
        message: `Te has inscrito en la ruta de aprendizaje: ${learningPath.title}`,
        link: `/student/learning-paths/${params.id}`,
      },
    });

    return NextResponse.json({
      enrollment,
      courseEnrollments,
      message: 'Inscripción exitosa',
    }, { status: 201 });
  } catch (error) {
    console.error('Error enrolling in learning path:', error);
    return NextResponse.json(
      { error: 'Error al inscribirse en la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}
