
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/learning-paths/[id]/courses - Add a course to a learning path
export async function POST(
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
    const { courseId, isRequired } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID del curso es requerido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
      include: {
        courses: true,
      },
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Ruta de aprendizaje no encontrada' },
        { status: 404 }
      );
    }

    if (learningPath.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta ruta' },
        { status: 403 }
      );
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Check if course is already in the learning path
    const existingCourse = await prisma.learningPathCourse.findUnique({
      where: {
        learningPathId_courseId: {
          learningPathId: params.id,
          courseId,
        },
      },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Este curso ya está en la ruta de aprendizaje' },
        { status: 400 }
      );
    }

    // Get the next order number
    const maxOrder = learningPath.courses.length > 0
      ? Math.max(...learningPath.courses.map(c => c.order))
      : 0;

    const learningPathCourse = await prisma.learningPathCourse.create({
      data: {
        learningPathId: params.id,
        courseId,
        order: maxOrder + 1,
        isRequired: isRequired !== undefined ? isRequired : true,
      },
      include: {
        course: true,
      },
    });

    return NextResponse.json({ learningPathCourse }, { status: 201 });
  } catch (error) {
    console.error('Error adding course to learning path:', error);
    return NextResponse.json(
      { error: 'Error al agregar el curso a la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}

// PUT /api/learning-paths/[id]/courses - Reorder courses in a learning path
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
    const { courseOrders } = body; // Array of { id, order }

    if (!Array.isArray(courseOrders)) {
      return NextResponse.json(
        { error: 'Formato de datos inválido' },
        { status: 400 }
      );
    }

    // Verify ownership
    const learningPath = await prisma.learningPath.findUnique({
      where: { id: params.id },
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Ruta de aprendizaje no encontrada' },
        { status: 404 }
      );
    }

    if (learningPath.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar esta ruta' },
        { status: 403 }
      );
    }

    // Update all course orders
    await Promise.all(
      courseOrders.map(({ id, order }) =>
        prisma.learningPathCourse.update({
          where: { id },
          data: { order },
        })
      )
    );

    return NextResponse.json({ message: 'Orden actualizado exitosamente' });
  } catch (error) {
    console.error('Error reordering courses:', error);
    return NextResponse.json(
      { error: 'Error al reordenar los cursos' },
      { status: 500 }
    );
  }
}
