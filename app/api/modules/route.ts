
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET /api/modules?courseId=xxx - Listar módulos de un curso
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    return NextResponse.json({ error: 'Error al obtener módulos' }, { status: 500 });
  }
}

// POST /api/modules - Crear un nuevo módulo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, title, description } = body;

    // Verificar que el instructor sea el dueño del curso
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado o no autorizado' }, { status: 404 });
    }

    // Obtener el último orden
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastModule ? lastModule.order + 1 : 1;

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        order: newOrder
      },
      include: {
        lessons: true
      }
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error('Error al crear módulo:', error);
    return NextResponse.json({ error: 'Error al crear módulo' }, { status: 500 });
  }
}
