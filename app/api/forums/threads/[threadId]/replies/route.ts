
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/forums/threads/[threadId]/replies - Obtener respuestas de un hilo
export async function GET(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { threadId } = params;

    // Obtener solo respuestas raíz (sin padre)
    const replies = await prisma.forumReply.findMany({
      where: {
        threadId,
        parentReplyId: null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        childReplies: {
          include: {
            author: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
            votes: {
              where: { userId: session.user.id },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: {
          where: { userId: session.user.id },
        },
      },
      orderBy: [
        { isMarkedAsSolution: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Calcular votos netos para cada respuesta
    const repliesWithVotes = await Promise.all(
      replies.map(async (reply) => {
        const votes = await prisma.forumVote.groupBy({
          by: ['voteType'],
          where: { replyId: reply.id },
          _count: true,
        });

        const upvotes = votes.find((v) => v.voteType === 'upvote')?._count || 0;
        const downvotes = votes.find((v) => v.voteType === 'downvote')?._count || 0;

        // También calcular votos para respuestas anidadas
        const childRepliesWithVotes = await Promise.all(
          reply.childReplies.map(async (childReply) => {
            const childVotes = await prisma.forumVote.groupBy({
              by: ['voteType'],
              where: { replyId: childReply.id },
              _count: true,
            });

            const childUpvotes =
              childVotes.find((v) => v.voteType === 'upvote')?._count || 0;
            const childDownvotes =
              childVotes.find((v) => v.voteType === 'downvote')?._count || 0;

            return {
              ...childReply,
              netVotes: childUpvotes - childDownvotes,
              userVote: childReply.votes[0]?.voteType || null,
              votes: undefined,
            };
          })
        );

        return {
          ...reply,
          netVotes: upvotes - downvotes,
          userVote: reply.votes[0]?.voteType || null,
          childReplies: childRepliesWithVotes,
          votes: undefined,
        };
      })
    );

    return NextResponse.json(repliesWithVotes);
  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    return NextResponse.json(
      { error: 'Error al obtener respuestas del foro' },
      { status: 500 }
    );
  }
}

// POST /api/forums/threads/[threadId]/replies - Crear una respuesta
export async function POST(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { threadId } = params;
    const body = await req.json();
    const { content, parentReplyId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'El contenido es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el hilo existe y no está bloqueado
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        course: { select: { id: true, instructorId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Hilo no encontrado' }, { status: 404 });
    }

    if (thread.isLocked) {
      return NextResponse.json(
        { error: 'Este hilo está bloqueado y no acepta nuevas respuestas' },
        { status: 403 }
      );
    }

    // Verificar que el usuario está inscrito en el curso o es el instructor
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: thread.courseId,
        },
      },
    });

    if (!enrollment && thread.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Debes estar inscrito en el curso para responder' },
        { status: 403 }
      );
    }

    const reply = await prisma.forumReply.create({
      data: {
        content,
        authorId: session.user.id,
        threadId,
        parentReplyId: parentReplyId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error al crear respuesta:', error);
    return NextResponse.json(
      { error: 'Error al crear respuesta en el foro' },
      { status: 500 }
    );
  }
}
