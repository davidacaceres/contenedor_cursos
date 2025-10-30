
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/learning-paths - Get all published learning paths or instructor's paths
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const instructorOnly = searchParams.get('instructorOnly') === 'true';

    let learningPaths;

    if (session && instructorOnly && session.user?.role === 'INSTRUCTOR') {
      // Get instructor's learning paths
      learningPaths = await prisma.learningPath.findMany({
        where: {
          instructorId: session.user.id,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  description: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Get all published learning paths
      learningPaths = await prisma.learningPath.findMany({
        where: {
          isPublished: true,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                  description: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json({ learningPaths });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Error al obtener las rutas de aprendizaje' },
      { status: 500 }
    );
  }
}

// POST /api/learning-paths - Create a new learning path
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, thumbnail, level, estimatedHours, isPublished } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título y descripción son requeridos' },
        { status: 400 }
      );
    }

    const learningPath = await prisma.learningPath.create({
      data: {
        title,
        description,
        thumbnail,
        level,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        isPublished: isPublished || false,
        instructorId: session.user.id,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ learningPath }, { status: 201 });
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Error al crear la ruta de aprendizaje' },
      { status: 500 }
    );
  }
}
