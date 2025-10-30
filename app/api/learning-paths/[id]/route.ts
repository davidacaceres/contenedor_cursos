
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/learning-paths/[id] - Get a specific learning path
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const learningPath = await prisma.learningPath.findUnique({
      where: {
        id: params.id,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        courses: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                _count: {
                  select: {
                    enrollments: true,
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
        _count: {
          select: {
            enrollments: true,
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

    // Check if user is enrolled (if logged in)
    const session = await getServerSession(authOptions);
    let isEnrolled = false;
    let enrollment = null;

    if (session?.user?.id) {
      enrollment = await prisma.learningPathEnrollment.findUnique({
        where: {
          userId_learningPathId: {
            userId: session.user.id,
            learningPathId: params.id,
          },
        },
      });
      isEnrolled = !!enrollment;
    }

    return NextResponse.json({
      learningPath,
      isEnrolled,
      enrollment,
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Error al obtener la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}

// PUT /api/learning-paths/[id] - Update a learning path
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, thumbnail, level, estimatedHours, isPublished } = body;

    // Verify ownership
    const existingPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
    });

    if (!existingPath) {
      return NextResponse.json(
        { error: 'Ruta de aprendizaje no encontrada' },
        { status: 404 }
      );
    }

    if (existingPath.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar esta ruta' },
        { status: 403 }
      );
    }

    const learningPath = await prisma.learningPath.update({
      where: { id: params.id },
      data: {
        title,
        description,
        thumbnail,
        level,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        isPublished,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        courses: {
          include: {
            course: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json({ learningPath });
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}

// DELETE /api/learning-paths/[id] - Delete a learning path
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
    });

    if (!existingPath) {
      return NextResponse.json(
        { error: 'Ruta de aprendizaje no encontrada' },
        { status: 404 }
      );
    }

    if (existingPath.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar esta ruta' },
        { status: 403 }
      );
    }

    await prisma.learningPath.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Ruta de aprendizaje eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}
