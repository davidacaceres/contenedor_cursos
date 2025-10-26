
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Endpoint público para verificar certificados
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: code },
      include: {
        user: {
          select: {
            name: true
          }
        },
        course: {
          select: {
            title: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message: 'Certificado no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        code: certificate.certificateCode,
        studentName: certificate.user.name,
        courseName: certificate.course.title,
        instructorName: certificate.course.instructor.name,
        issuedAt: certificate.issuedAt
      }
    });
  } catch (error) {
    console.error('Error verificando certificado:', error);
    return NextResponse.json(
      { error: 'Error al verificar certificado' },
      { status: 500 }
    );
  }
}
