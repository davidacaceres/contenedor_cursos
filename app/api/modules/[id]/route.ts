
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/modules/[id] - Obtener un módulo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        },
        course: true
      }
    });

    if (!module) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error al obtener módulo:', error);
    return NextResponse.json({ error: 'Error al obtener módulo' }, { status: 500 });
  }
}

// PUT /api/modules/[id] - Actualizar un módulo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: { course: true }
    });

    if (!module) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    if (module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, order } = body;

    const updatedModule = await prisma.module.update({
      where: { id: params.id },
      data: {
        title,
        description,
        ...(order !== undefined && { order })
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Error al actualizar módulo:', error);
    return NextResponse.json({ error: 'Error al actualizar módulo' }, { status: 500 });
  }
}

// DELETE /api/modules/[id] - Eliminar un módulo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: { course: true }
    });

    if (!module) {
      return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 });
    }

    if (module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.module.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Módulo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar módulo:', error);
    return NextResponse.json({ error: 'Error al eliminar módulo' }, { status: 500 });
  }
}
