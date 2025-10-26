
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificado no encontrado' }, { status: 404 });
    }

    // Verificar que el certificado pertenece al usuario
    if (certificate.userId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error('Error obteniendo certificado:', error);
    return NextResponse.json(
      { error: 'Error al obtener certificado' },
      { status: 500 }
    );
  }
}
