
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Obtener rúbrica de una tarea
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'ID de tarea requerido' },
        { status: 400 }
      );
    }

    const rubric = await prisma.rubric.findFirst({
      where: { assignmentId },
      include: {
        assignment: {
          select: {
            title: true,
            maxScore: true,
          },
        },
      },
    });

    return NextResponse.json(rubric);
  } catch (error) {
    console.error('Error al obtener rúbrica:', error);
    return NextResponse.json(
      { error: 'Error al obtener rúbrica' },
      { status: 500 }
    );
  }
}

// POST - Crear rúbrica (solo instructores)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { assignmentId, criteriaData } = body;

    if (!assignmentId || !criteriaData) {
      return NextResponse.json(
        { error: 'assignmentId y criteriaData son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la tarea existe y pertenece al instructor
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    if (assignment.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Validar que los puntos totales coincidan con maxScore
    const totalPoints = criteriaData.reduce(
      (sum: number, criterion: any) => sum + (criterion.points || 0),
      0
    );

    if (totalPoints !== assignment.maxScore) {
      return NextResponse.json(
        {
          error: `Los puntos totales de la rúbrica (${totalPoints}) deben coincidir con la puntuación máxima de la tarea (${assignment.maxScore})`,
        },
        { status: 400 }
      );
    }

    // Crear o actualizar rúbrica
    const existingRubric = await prisma.rubric.findFirst({
      where: { assignmentId },
    });

    const rubric = existingRubric
      ? await prisma.rubric.update({
          where: { id: existingRubric.id },
          data: { criteriaData },
        })
      : await prisma.rubric.create({
          data: {
            assignmentId,
            criteriaData,
          },
        });

    return NextResponse.json(rubric, { status: 201 });
  } catch (error) {
    console.error('Error al crear rúbrica:', error);
    return NextResponse.json(
      { error: 'Error al crear rúbrica' },
      { status: 500 }
    );
  }
}
