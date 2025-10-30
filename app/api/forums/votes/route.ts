
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// POST /api/forums/votes - Votar en un hilo o respuesta
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { threadId, replyId, voteType } = body;

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Tipo de voto inválido. Debe ser "upvote" o "downvote"' },
        { status: 400 }
      );
    }

    if (!threadId && !replyId) {
      return NextResponse.json(
        { error: 'Debe especificar threadId o replyId' },
        { status: 400 }
      );
    }

    if (threadId && replyId) {
      return NextResponse.json(
        { error: 'Solo puede votar en un hilo o una respuesta, no ambos' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya votó
    const existingVote = await prisma.forumVote.findFirst({
      where: {
        userId: session.user.id,
        ...(threadId ? { threadId } : { replyId }),
      },
    });

    if (existingVote) {
      // Si el voto es el mismo, eliminarlo (toggle)
      if (existingVote.voteType === voteType) {
        await prisma.forumVote.delete({
          where: { id: existingVote.id },
        });
        return NextResponse.json({ message: 'Voto eliminado', action: 'removed' });
      } else {
        // Si el voto es diferente, actualizarlo
        const updatedVote = await prisma.forumVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        return NextResponse.json({ vote: updatedVote, action: 'updated' });
      }
    }

    // Crear un nuevo voto
    const vote = await prisma.forumVote.create({
      data: {
        userId: session.user.id,
        threadId: threadId || null,
        replyId: replyId || null,
        voteType,
      },
    });

    return NextResponse.json({ vote, action: 'created' }, { status: 201 });
  } catch (error) {
    console.error('Error al votar:', error);
    return NextResponse.json({ error: 'Error al registrar voto' }, { status: 500 });
  }
}

// DELETE /api/forums/votes - Eliminar un voto
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const replyId = searchParams.get('replyId');

    if (!threadId && !replyId) {
      return NextResponse.json(
        { error: 'Debe especificar threadId o replyId' },
        { status: 400 }
      );
    }

    const vote = await prisma.forumVote.findFirst({
      where: {
        userId: session.user.id,
        ...(threadId ? { threadId } : { replyId }),
      },
    });

    if (!vote) {
      return NextResponse.json({ error: 'Voto no encontrado' }, { status: 404 });
    }

    await prisma.forumVote.delete({
      where: { id: vote.id },
    });

    return NextResponse.json({ message: 'Voto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar voto:', error);
    return NextResponse.json({ error: 'Error al eliminar voto' }, { status: 500 });
  }
}
