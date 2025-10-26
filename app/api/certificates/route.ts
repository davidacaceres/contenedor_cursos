
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateCertificateCode } from '@/lib/certificate-generator';

// GET - Obtener certificados del usuario autenticado
export async function GET(req: NextRequest) {
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

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error('Error obteniendo certificados:', error);
    return NextResponse.json(
      { error: 'Error al obtener certificados' },
      { status: 500 }
    );
  }
}

// POST - Generar certificado si el curso está completo
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'courseId requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Verificar si ya tiene certificado
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (existingCertificate) {
      return NextResponse.json({ 
        message: 'Ya tienes un certificado para este curso',
        certificate: existingCertificate 
      });
    }

    // Verificar si está inscrito
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 403 }
      );
    }

    // Obtener total de lecciones del curso
    const totalLessons = await prisma.lesson.count({
      where: { courseId: courseId }
    });

    if (totalLessons === 0) {
      return NextResponse.json(
        { error: 'Este curso no tiene lecciones' },
        { status: 400 }
      );
    }

    // Verificar cuántas lecciones ha completado
    const completedLessons = await prisma.progress.count({
      where: {
        userId: user.id,
        completed: true,
        lesson: {
          courseId: courseId
        }
      }
    });

    // Verificar si completó el 100%
    if (completedLessons < totalLessons) {
      return NextResponse.json({
        error: 'Debes completar todas las lecciones para obtener el certificado',
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: Math.round((completedLessons / totalLessons) * 100)
        }
      }, { status: 400 });
    }

    // Generar código único
    let certificateCode = generateCertificateCode();
    
    // Asegurar que el código sea único
    let codeExists = await prisma.certificate.findUnique({
      where: { certificateCode }
    });
    
    while (codeExists) {
      certificateCode = generateCertificateCode();
      codeExists = await prisma.certificate.findUnique({
        where: { certificateCode }
      });
    }

    // Crear certificado
    const certificate = await prisma.certificate.create({
      data: {
        certificateCode,
        userId: user.id,
        courseId: courseId,
        issuedAt: new Date()
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: '¡Felicitaciones! Certificado generado exitosamente',
      certificate
    }, { status: 201 });
  } catch (error) {
    console.error('Error generando certificado:', error);
    return NextResponse.json(
      { error: 'Error al generar certificado' },
      { status: 500 }
    );
  }
}
