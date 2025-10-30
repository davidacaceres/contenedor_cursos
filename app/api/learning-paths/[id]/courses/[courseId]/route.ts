
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE /api/learning-paths/[id]/courses/[courseId] - Remove a course from a learning path
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; courseId: string } }
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

    // Delete the course from the learning path
    await prisma.learningPathCourse.delete({
      where: {
        learningPathId_courseId: {
          learningPathId: params.id,
          courseId: params.courseId,
        },
      },
    });

    return NextResponse.json({ message: 'Curso eliminado de la ruta exitosamente' });
  } catch (error) {
    console.error('Error removing course from learning path:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el curso de la ruta' },
      { status: 500 }
    );
  }
}
