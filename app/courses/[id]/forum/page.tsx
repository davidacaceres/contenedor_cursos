
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForumThreadList } from '@/components/forums/forum-thread-list';
import { CreateThreadDialog } from '@/components/forums/create-thread-dialog';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CourseForumPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Error al cargar curso');
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error al cargar curso:', error);
      toast.error('Error al cargar curso');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Curso no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al curso
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Foro de Discusión</CardTitle>
          <p className="text-muted-foreground">{course.title}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este es el espacio para hacer preguntas, compartir ideas y colaborar con
            otros estudiantes e instructores del curso.
          </p>
        </CardContent>
      </Card>

      <ForumThreadList
        courseId={courseId}
        onCreateThread={() => setCreateDialogOpen(true)}
      />

      <CreateThreadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        courseId={courseId}
        onThreadCreated={() => {
          // El componente ForumThreadList se actualizará automáticamente
        }}
      />
    </div>
  );
}
