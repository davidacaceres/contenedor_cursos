
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { downloadFile } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        assignment: {
          include: {
            course: {
              select: {
                instructorId: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Envío no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos
    const isOwner = submission.userId === session.user.id;
    const isInstructor =
      session.user.role === 'INSTRUCTOR' &&
      submission.assignment.course.instructorId === session.user.id;

    if (!isOwner && !isInstructor) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (!submission.cloud_storage_path) {
      return NextResponse.json(
        { error: 'No hay archivo adjunto' },
        { status: 404 }
      );
    }

    // Generar URL firmada
    const signedUrl = await downloadFile(submission.cloud_storage_path);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    return NextResponse.json(
      { error: 'Error al descargar archivo' },
      { status: 500 }
    );
  }
}
