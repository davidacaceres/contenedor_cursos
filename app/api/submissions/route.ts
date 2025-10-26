
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/storage';

// GET - Obtener envíos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get('assignmentId');
    const courseId = searchParams.get('courseId');

    let where: any = {};

    if (session.user.role === 'STUDENT') {
      // Estudiantes solo ven sus propios envíos
      where.userId = session.user.id;
      if (assignmentId) {
        where.assignmentId = assignmentId;
      }
    } else if (session.user.role === 'INSTRUCTOR') {
      // Instructores ven envíos de sus cursos
      if (assignmentId) {
        where.assignmentId = assignmentId;
      } else if (courseId) {
        where.assignment = {
          courseId,
          course: {
            instructorId: session.user.id,
          },
        };
      }
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        assignment: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error al obtener envíos:', error);
    return NextResponse.json(
      { error: 'Error al obtener envíos' },
      { status: 500 }
    );
  }
}

// POST - Crear/actualizar envío de tarea (estudiantes)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const assignmentId = formData.get('assignmentId') as string;
    const content = formData.get('content') as string;
    const file = formData.get('file') as File | null;
    const answersDataString = formData.get('answersData') as string | null;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'ID de tarea requerido' },
        { status: 400 }
      );
    }

    // Verificar que la tarea existe
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el estudiante está inscrito en el curso
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: assignment.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      );
    }

    // Subir archivo a S3 si existe
    let cloudStoragePath: string | null = null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      cloudStoragePath = await uploadFile(buffer, file.name);
    }

    // Procesar respuestas de opción múltiple
    let answersData: Record<number, number> | undefined = undefined;
    let autoScore: number | null = null;

    if (answersDataString && assignment.isAutoGraded) {
      answersData = JSON.parse(answersDataString) as Record<number, number>;
      
      // Calcular calificación automática
      const questions = assignment.questionsData as any[];
      let correctCount = 0;

      questions.forEach((question: any, index: number) => {
        if (answersData && answersData[index] === question.correctAnswer) {
          correctCount++;
        }
      });

      autoScore = Math.round((correctCount / questions.length) * assignment.maxScore);
    }

    // Crear o actualizar envío
    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId,
          userId: session.user.id,
        },
      },
      create: {
        assignmentId,
        userId: session.user.id,
        content: content || null,
        cloud_storage_path: cloudStoragePath,
        ...(answersData && { answersData }),
        status: assignment.isAutoGraded ? 'GRADED' : 'SUBMITTED',
        submittedAt: new Date(),
        ...(assignment.isAutoGraded && {
          score: autoScore,
          gradedAt: new Date(),
        }),
      },
      update: {
        content: content || null,
        ...(cloudStoragePath && { cloud_storage_path: cloudStoragePath }),
        ...(answersData && { answersData }),
        status: assignment.isAutoGraded ? 'GRADED' : 'SUBMITTED',
        submittedAt: new Date(),
        ...(assignment.isAutoGraded && {
          score: autoScore,
          gradedAt: new Date(),
        }),
      },
      include: {
        assignment: {
          select: {
            title: true,
            maxScore: true,
            isAutoGraded: true,
          },
        },
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error al enviar tarea:', error);
    return NextResponse.json(
      { error: 'Error al enviar tarea' },
      { status: 500 }
    );
  }
}
