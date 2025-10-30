
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/forums/threads - Obtener hilos de un curso
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    // Construir filtros
    const where: any = { courseId };
    if (moduleId) where.moduleId = moduleId;
    if (lessonId) where.lessonId = lessonId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          _count: {
            select: { replies: true, votes: true },
          },
          votes: {
            where: { userId: session.user.id },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    // Calcular votos netos para cada hilo
    const threadsWithVotes = await Promise.all(
      threads.map(async (thread) => {
        const votes = await prisma.forumVote.groupBy({
          by: ['voteType'],
          where: { threadId: thread.id },
          _count: true,
        });

        const upvotes = votes.find((v) => v.voteType === 'upvote')?._count || 0;
        const downvotes = votes.find((v) => v.voteType === 'downvote')?._count || 0;

        return {
          ...thread,
          netVotes: upvotes - downvotes,
          userVote: thread.votes[0]?.voteType || null,
          votes: undefined,
        };
      })
    );

    return NextResponse.json({
      threads: threadsWithVotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener hilos:', error);
    return NextResponse.json(
      { error: 'Error al obtener hilos del foro' },
      { status: 500 }
    );
  }
}

// POST /api/forums/threads - Crear un nuevo hilo
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, courseId, moduleId, lessonId } = body;

    if (!title || !content || !courseId) {
      return NextResponse.json(
        { error: 'Título, contenido y courseId son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté inscrito en el curso
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    // O que sea el instructor del curso
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!enrollment && course?.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Debes estar inscrito en el curso para crear un hilo' },
        { status: 403 }
      );
    }

    const thread = await prisma.forumThread.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        courseId,
        moduleId: moduleId || null,
        lessonId: lessonId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error('Error al crear hilo:', error);
    return NextResponse.json(
      { error: 'Error al crear hilo del foro' },
      { status: 500 }
    );
  }
}
