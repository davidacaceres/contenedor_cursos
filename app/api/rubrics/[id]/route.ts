
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE - Eliminar rúbrica (solo instructores)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const rubric = await prisma.rubric.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!rubric) {
      return NextResponse.json(
        { error: 'Rúbrica no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (rubric.assignment.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.rubric.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Rúbrica eliminada' });
  } catch (error) {
    console.error('Error al eliminar rúbrica:', error);
    return NextResponse.json(
      { error: 'Error al eliminar rúbrica' },
      { status: 500 }
    );
  }
}
