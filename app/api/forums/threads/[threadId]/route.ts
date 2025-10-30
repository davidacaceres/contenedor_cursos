
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/forums/threads/[threadId] - Obtener un hilo específico
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

    // Incrementar el contador de vistas
    await prisma.forumThread.update({
      where: { id: threadId },
      data: { viewCount: { increment: 1 } },
    });

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
        course: {
          select: { id: true, title: true, instructorId: true },
        },
        module: {
          select: { id: true, title: true },
        },
        lesson: {
          select: { id: true, title: true },
        },
        _count: {
          select: { replies: true },
        },
        votes: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Hilo no encontrado' }, { status: 404 });
    }

    // Calcular votos netos
    const votes = await prisma.forumVote.groupBy({
      by: ['voteType'],
      where: { threadId: thread.id },
      _count: true,
    });

    const upvotes = votes.find((v) => v.voteType === 'upvote')?._count || 0;
    const downvotes = votes.find((v) => v.voteType === 'downvote')?._count || 0;

    const threadWithVotes = {
      ...thread,
      netVotes: upvotes - downvotes,
      userVote: thread.votes[0]?.voteType || null,
      votes: undefined,
    };

    return NextResponse.json(threadWithVotes);
  } catch (error) {
    console.error('Error al obtener hilo:', error);
    return NextResponse.json(
      { error: 'Error al obtener hilo del foro' },
      { status: 500 }
    );
  }
}

// PATCH /api/forums/threads/[threadId] - Actualizar un hilo
export async function PATCH(
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

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Hilo no encontrado' }, { status: 404 });
    }

    // Solo el autor o el instructor del curso pueden editar el hilo
    const isAuthor = thread.authorId === session.user.id;
    const isInstructor = thread.course.instructorId === session.user.id;

    if (!isAuthor && !isInstructor) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este hilo' },
        { status: 403 }
      );
    }

    // Instructores pueden fijar/bloquear hilos
    const updateData: any = {};
    if (body.title && isAuthor) updateData.title = body.title;
    if (body.content && isAuthor) updateData.content = body.content;
    if (typeof body.isPinned === 'boolean' && isInstructor)
      updateData.isPinned = body.isPinned;
    if (typeof body.isLocked === 'boolean' && isInstructor)
      updateData.isLocked = body.isLocked;

    const updatedThread = await prisma.forumThread.update({
      where: { id: threadId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Error al actualizar hilo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar hilo del foro' },
      { status: 500 }
    );
  }
}

// DELETE /api/forums/threads/[threadId] - Eliminar un hilo
export async function DELETE(
  req: Request,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { threadId } = params;

    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        course: { select: { instructorId: true } },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Hilo no encontrado' }, { status: 404 });
    }

    // Solo el autor o el instructor del curso pueden eliminar el hilo
    const isAuthor = thread.authorId === session.user.id;
    const isInstructor = thread.course.instructorId === session.user.id;

    if (!isAuthor && !isInstructor) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este hilo' },
        { status: 403 }
      );
    }

    await prisma.forumThread.delete({
      where: { id: threadId },
    });

    return NextResponse.json({ message: 'Hilo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar hilo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar hilo del foro' },
      { status: 500 }
    );
  }
}
