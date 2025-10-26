
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
  };
}

export function SubmissionComments({ submissionId }: { submissionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [submissionId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?submissionId=${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Escribe un comentario antes de enviar');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, content: newComment })
      });

      if (response.ok) {
        toast.success('Comentario enviado');
        setNewComment('');
        fetchComments();
      } else {
        toast.error('Error al enviar comentario');
      }
    } catch (error) {
      toast.error('Error al enviar comentario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentarios y Retroalimentación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de comentarios */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay comentarios aún. Sé el primero en comentar.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback>
                    {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.user.name || comment.user.email}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {comment.user.role === 'INSTRUCTOR' ? 'Instructor' : 'Estudiante'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para nuevo comentario */}
        <div className="space-y-2 pt-4 border-t">
          <Textarea
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={loading || !newComment.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Comentario'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
