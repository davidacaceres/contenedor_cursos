
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Pin, 
  Lock, 
  Plus,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  netVotes: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  _count: {
    replies: number;
  };
}

interface ForumThreadListProps {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  onCreateThread: () => void;
}

export function ForumThreadList({
  courseId,
  moduleId,
  lessonId,
  onCreateThread,
}: ForumThreadListProps) {
  const { data: session } = useSession() || {};
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchThreads();
  }, [courseId, moduleId, lessonId, searchQuery, page]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        courseId,
        page: page.toString(),
        limit: '20',
      });

      if (moduleId) params.append('moduleId', moduleId);
      if (lessonId) params.append('lessonId', lessonId);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/forums/threads?${params}`);
      if (!response.ok) throw new Error('Error al cargar hilos');

      const data = await response.json();
      setThreads(data.threads);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error al cargar hilos:', error);
      toast.error('Error al cargar los hilos del foro');
    } finally {
      setLoading(false);
    }
  };

  if (loading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Cargando hilos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar hilos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={onCreateThread}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Hilo
        </Button>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No hay hilos de discusión aún. ¡Sé el primero en crear uno!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <Card key={thread.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={thread.author.image} />
                    <AvatarFallback>
                      {thread.author.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/courses/${courseId}/forum/${thread.id}`}
                          className="font-semibold hover:underline line-clamp-1"
                        >
                          {thread.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{thread.author.name}</span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(thread.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                          {thread.author.role === 'INSTRUCTOR' && (
                            <Badge variant="secondary" className="text-xs">
                              Instructor
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {thread.isPinned && (
                          <Pin className="h-4 w-4 text-primary" />
                        )}
                        {thread.isLocked && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {thread.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{thread._count.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{thread.netVotes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{thread.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
