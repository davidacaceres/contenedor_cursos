
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// POST /api/courses/lessons - Crear una nueva lección
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, moduleId, title, content, type, videoUrl, pdfUrl, externalUrl, duration } = body;

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
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        moduleId: moduleId || null,
        title,
        content,
        type,
        videoUrl,
        pdfUrl,
        externalUrl,
        duration: duration || null,
        order: newOrder
      }
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error al crear lección:', error);
    return NextResponse.json({ error: 'Error al crear lección' }, { status: 500 });
  }
}
