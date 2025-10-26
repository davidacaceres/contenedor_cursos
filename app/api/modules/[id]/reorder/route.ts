
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// PUT /api/modules/[id]/reorder - Reordenar módulos
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { newOrder } = body;

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

    // Actualizar el orden del módulo
    await prisma.module.update({
      where: { id: params.id },
      data: { order: newOrder }
    });

    return NextResponse.json({ message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error al reordenar módulo:', error);
    return NextResponse.json({ error: 'Error al reordenar módulo' }, { status: 500 });
  }
}
