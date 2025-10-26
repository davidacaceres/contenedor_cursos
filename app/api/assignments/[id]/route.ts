
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener tarea específica
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            title: true,
            instructorId: true,
          },
        },
        lesson: {
          select: {
            title: true,
          },
        },
        submissions: {
          where: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return NextResponse.json(
      { error: 'Error al obtener tarea' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar tarea (solo instructor dueño)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, type, maxScore, dueDate } = body;

    // Verificar que el instructor sea dueño
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: true,
      },
    });

    if (!assignment || assignment.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const updated = await prisma.assignment.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(type && { type }),
        ...(maxScore && { maxScore }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tarea' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tarea (solo instructor dueño)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el instructor sea dueño
    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        course: true,
      },
    });

    if (!assignment || assignment.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    await prisma.assignment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tarea' },
      { status: 500 }
    );
  }
}
