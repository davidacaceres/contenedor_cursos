
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// PATCH /api/forums/replies/[replyId] - Actualizar una respuesta
export async function PATCH(
  req: Request,
  { params }: { params: { replyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { replyId } = params;
    const body = await req.json();

    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
      include: {
        thread: {
          include: {
            course: { select: { instructorId: true } },
          },
        },
      },
    });

    if (!reply) {
      return NextResponse.json({ error: 'Respuesta no encontrada' }, { status: 404 });
    }

    const updateData: any = {};
    const isAuthor = reply.authorId === session.user.id;
    const isInstructor = reply.thread.course.instructorId === session.user.id;

    // Solo el autor puede editar el contenido
    if (body.content && isAuthor) {
      updateData.content = body.content;
    }

    // Solo el instructor puede marcar como solución
    if (typeof body.isMarkedAsSolution === 'boolean' && isInstructor) {
      updateData.isMarkedAsSolution = body.isMarkedAsSolution;

      // Si se marca como solución, desmarcar otras respuestas en el mismo hilo
      if (body.isMarkedAsSolution) {
        await prisma.forumReply.updateMany({
          where: {
            threadId: reply.threadId,
            id: { not: replyId },
          },
          data: { isMarkedAsSolution: false },
        });
      }
    }

    if (!isAuthor && !isInstructor) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar esta respuesta' },
        { status: 403 }
      );
    }

    const updatedReply = await prisma.forumReply.update({
      where: { id: replyId },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, role: true },
        },
      },
    });

    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error('Error al actualizar respuesta:', error);
    return NextResponse.json(
      { error: 'Error al actualizar respuesta del foro' },
      { status: 500 }
    );
  }
}

// DELETE /api/forums/replies/[replyId] - Eliminar una respuesta
export async function DELETE(
  req: Request,
  { params }: { params: { replyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { replyId } = params;

    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
      include: {
        thread: {
          include: {
            course: { select: { instructorId: true } },
          },
        },
      },
    });

    if (!reply) {
      return NextResponse.json({ error: 'Respuesta no encontrada' }, { status: 404 });
    }

    // Solo el autor o el instructor del curso pueden eliminar la respuesta
    const isAuthor = reply.authorId === session.user.id;
    const isInstructor = reply.thread.course.instructorId === session.user.id;

    if (!isAuthor && !isInstructor) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar esta respuesta' },
        { status: 403 }
      );
    }

    await prisma.forumReply.delete({
      where: { id: replyId },
    });

    return NextResponse.json({ message: 'Respuesta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar respuesta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar respuesta del foro' },
      { status: 500 }
    );
  }
}
