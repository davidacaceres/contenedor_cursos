
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener tareas de un curso
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');

    if (!courseId) {
      return NextResponse.json({ error: 'ID de curso requerido' }, { status: 400 });
    }

    const where: any = { courseId };
    if (lessonId) {
      where.lessonId = lessonId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
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
          select: {
            id: true,
            status: true,
            score: true,
            submittedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener tareas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva tarea (solo instructores)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      description, 
      type, 
      courseId, 
      lessonId, 
      maxScore, 
      dueDate,
      isAutoGraded,
      questionsData 
    } = body;

    if (!title || !description || !courseId) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar que el instructor sea dueño del curso
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado o no autorizado' },
        { status: 403 }
      );
    }

    // Validar que si es auto-calificado, tenga preguntas
    if (isAutoGraded && (!questionsData || questionsData.length === 0)) {
      return NextResponse.json(
        { error: 'Las tareas auto-calificadas deben tener preguntas' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type: type || 'HOMEWORK',
        courseId,
        lessonId: lessonId || null,
        maxScore: maxScore || 100,
        dueDate: dueDate ? new Date(dueDate) : null,
        isAutoGraded: isAutoGraded || false,
        questionsData: questionsData || null,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        lesson: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear tarea' },
      { status: 500 }
    );
  }
}
