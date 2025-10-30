
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Pin,
  Lock,
  CheckCircle,
  Edit,
  Trash2,
  Reply as ReplyIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Reply {
  id: string;
  content: string;
  isMarkedAsSolution: boolean;
  netVotes: number;
  userVote: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  childReplies?: Reply[];
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  netVotes: number;
  userVote: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  course: {
    id: string;
    title: string;
    instructorId: string;
  };
  _count: {
    replies: number;
  };
}

interface ForumThreadDetailProps {
  threadId: string;
}

export function ForumThreadDetail({ threadId }: ForumThreadDetailProps) {
  const { data: session } = useSession() || {};
  const router = useRouter();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'thread' | 'reply';
    id: string;
  } | null>(null);

  useEffect(() => {
    fetchThreadAndReplies();
  }, [threadId]);

  const fetchThreadAndReplies = async () => {
    try {
      setLoading(true);
      const [threadRes, repliesRes] = await Promise.all([
        fetch(`/api/forums/threads/${threadId}`),
        fetch(`/api/forums/threads/${threadId}/replies`),
      ]);

      if (!threadRes.ok || !repliesRes.ok) {
        throw new Error('Error al cargar el hilo');
      }

      const threadData = await threadRes.json();
      const repliesData = await repliesRes.json();

      setThread(threadData);
      setReplies(repliesData);
    } catch (error) {
      console.error('Error al cargar el hilo:', error);
      toast.error('Error al cargar el hilo');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (
    type: 'thread' | 'reply',
    id: string,
    voteType: 'upvote' | 'downvote'
  ) => {
    try {
      const body =
        type === 'thread' ? { threadId: id, voteType } : { replyId: id, voteType };

      const response = await fetch('/api/forums/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al votar');

      await fetchThreadAndReplies();
    } catch (error) {
      console.error('Error al votar:', error);
      toast.error('Error al registrar voto');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('El contenido de la respuesta no puede estar vacío');
      return;
    }

    try {
      const response = await fetch(`/api/forums/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentReplyId: replyingTo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear respuesta');
      }

      toast.success('Respuesta creada exitosamente');
      setReplyContent('');
      setReplyingTo(null);
      await fetchThreadAndReplies();
    } catch (error: any) {
      console.error('Error al crear respuesta:', error);
      toast.error(error.message || 'Error al crear respuesta');
    }
  };

  const handleEditReply = async (replyId: string) => {
    if (!editContent.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }

    try {
      const response = await fetch(`/api/forums/replies/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error('Error al editar respuesta');

      toast.success('Respuesta editada exitosamente');
      setEditingReply(null);
      setEditContent('');
      await fetchThreadAndReplies();
    } catch (error) {
      console.error('Error al editar respuesta:', error);
      toast.error('Error al editar respuesta');
    }
  };

  const handleMarkAsSolution = async (replyId: string) => {
    try {
      const response = await fetch(`/api/forums/replies/${replyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isMarkedAsSolution: true }),
      });

      if (!response.ok) throw new Error('Error al marcar como solución');

      toast.success('Respuesta marcada como solución');
      await fetchThreadAndReplies();
    } catch (error) {
      console.error('Error al marcar como solución:', error);
      toast.error('Error al marcar como solución');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const url =
        itemToDelete.type === 'thread'
          ? `/api/forums/threads/${itemToDelete.id}`
          : `/api/forums/replies/${itemToDelete.id}`;

      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success(
        `${itemToDelete.type === 'thread' ? 'Hilo' : 'Respuesta'} eliminado exitosamente`
      );

      if (itemToDelete.type === 'thread') {
        router.back();
      } else {
        await fetchThreadAndReplies();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar');
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handlePinToggle = async () => {
    if (!thread) return;

    try {
      const response = await fetch(`/api/forums/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !thread.isPinned }),
      });

      if (!response.ok) throw new Error('Error al actualizar hilo');

      toast.success(
        `Hilo ${thread.isPinned ? 'desfijado' : 'fijado'} exitosamente`
      );
      await fetchThreadAndReplies();
    } catch (error) {
      console.error('Error al actualizar hilo:', error);
      toast.error('Error al actualizar hilo');
    }
  };

  const handleLockToggle = async () => {
    if (!thread) return;

    try {
      const response = await fetch(`/api/forums/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !thread.isLocked }),
      });

      if (!response.ok) throw new Error('Error al actualizar hilo');

      toast.success(
        `Hilo ${thread.isLocked ? 'desbloqueado' : 'bloqueado'} exitosamente`
      );
      await fetchThreadAndReplies();
    } catch (error) {
      console.error('Error al actualizar hilo:', error);
      toast.error('Error al actualizar hilo');
    }
  };

  const renderReply = (reply: Reply, isNested = false) => (
    <Card key={reply.id} className={isNested ? 'ml-8 mt-2' : 'mt-2'}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={reply.author.image} />
              <AvatarFallback>
                {reply.author.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleVote('reply', reply.id, 'upvote')}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    reply.userVote === 'upvote' ? 'fill-primary text-primary' : ''
                  }`}
                />
              </Button>
              <span className="text-sm font-medium">{reply.netVotes}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleVote('reply', reply.id, 'downvote')}
              >
                <ThumbsDown
                  className={`h-4 w-4 ${
                    reply.userVote === 'downvote' ? 'fill-destructive text-destructive' : ''
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {reply.author.name}
              </span>
              {reply.author.role === 'INSTRUCTOR' && (
                <Badge variant="secondary" className="text-xs">
                  Instructor
                </Badge>
              )}
              {reply.isMarkedAsSolution && (
                <Badge className="text-xs bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Solución
                </Badge>
              )}
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>

            {editingReply === reply.id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleEditReply(reply.id)}
                  >
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingReply(null);
                      setEditContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm whitespace-pre-wrap">{reply.content}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {!thread?.isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(reply.id);
                    setReplyContent(`@${reply.author.name} `);
                  }}
                >
                  <ReplyIcon className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}

              {session?.user?.id === reply.author.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingReply(reply.id);
                    setEditContent(reply.content);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}

              {thread &&
                session?.user?.id === thread.course.instructorId &&
                !reply.isMarkedAsSolution && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsSolution(reply.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marcar como solución
                  </Button>
                )}

              {(session?.user?.id === reply.author.id ||
                session?.user?.id === thread?.course.instructorId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setItemToDelete({ type: 'reply', id: reply.id });
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>

            {reply.childReplies && reply.childReplies.length > 0 && (
              <div className="mt-2">
                {reply.childReplies.map((childReply) =>
                  renderReply(childReply, true)
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Hilo no encontrado</div>
      </div>
    );
  }

  const isInstructor = session?.user?.id === thread.course.instructorId;
  const isAuthor = session?.user?.id === thread.author.id;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.isPinned && (
                  <Pin className="h-4 w-4 text-primary" />
                )}
                {thread.isLocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <CardTitle className="text-2xl">{thread.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={thread.author.image} />
                  <AvatarFallback>
                    {thread.author.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{thread.author.name}</span>
                {thread.author.role === 'INSTRUCTOR' && (
                  <Badge variant="secondary" className="text-xs">
                    Instructor
                  </Badge>
                )}
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(thread.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('thread', thread.id, 'upvote')}
              >
                <ThumbsUp
                  className={`h-4 w-4 ${
                    thread.userVote === 'upvote' ? 'fill-primary text-primary' : ''
                  }`}
                />
              </Button>
              <span className="text-lg font-medium">{thread.netVotes}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('thread', thread.id, 'downvote')}
              >
                <ThumbsDown
                  className={`h-4 w-4 ${
                    thread.userVote === 'downvote'
                      ? 'fill-destructive text-destructive'
                      : ''
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{thread.content}</p>

          {isInstructor && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={handlePinToggle}>
                <Pin className="h-4 w-4 mr-2" />
                {thread.isPinned ? 'Desfijar' : 'Fijar'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLockToggle}>
                <Lock className="h-4 w-4 mr-2" />
                {thread.isLocked ? 'Desbloquear' : 'Bloquear'}
              </Button>
            </div>
          )}

          {(isAuthor || isInstructor) && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setItemToDelete({ type: 'thread', id: thread.id });
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Hilo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {replies.length} Respuestas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!thread.isLocked && (
            <div className="mb-4 space-y-2">
              <Textarea
                placeholder={
                  replyingTo
                    ? 'Escribe tu respuesta...'
                    : 'Responde a esta discusión...'
                }
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleReply}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {replyingTo ? 'Responder' : 'Agregar Respuesta'}
                </Button>
                {replyingTo && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )}

          {thread.isLocked && (
            <div className="mb-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              Este hilo está bloqueado y no acepta nuevas respuestas.
            </div>
          )}

          {replies.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay respuestas aún. ¡Sé el primero en responder!
            </p>
          ) : (
            <div className="space-y-2">
              {replies.map((reply) => renderReply(reply))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el{' '}
              {itemToDelete?.type === 'thread' ? 'hilo' : 'respuesta'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
