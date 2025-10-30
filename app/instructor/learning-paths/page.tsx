
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, BookOpen, Clock, Eye, EyeOff } from 'lucide-react';

export default async function InstructorLearningPathsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'INSTRUCTOR') {
    redirect('/auth/signin');
  }

  const learningPaths = await prisma.learningPath.findMany({
    where: {
      instructorId: session.user.id,
    },
    include: {
      _count: {
        select: {
          courses: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis Rutas de Aprendizaje</h1>
          <p className="text-muted-foreground">
            Crea y gestiona rutas de aprendizaje para guiar a tus estudiantes
          </p>
        </div>
        <Link href="/instructor/learning-paths/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Ruta
          </Button>
        </Link>
      </div>

      {learningPaths.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No tienes rutas de aprendizaje</h2>
            <p className="text-muted-foreground text-center mb-4">
              Crea tu primera ruta de aprendizaje para organizar cursos en una secuencia estructurada
            </p>
            <Link href="/instructor/learning-paths/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Ruta
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                {path.thumbnail && (
                  <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={path.thumbnail}
                      alt={path.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2">{path.title}</CardTitle>
                  {path.isPublished ? (
                    <Badge variant="default" className="gap-1 flex-shrink-0">
                      <Eye className="h-3 w-3" />
                      Publicada
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 flex-shrink-0">
                      <EyeOff className="h-3 w-3" />
                      Borrador
                    </Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {path.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{path._count.courses} cursos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{path._count.enrollments} inscritos</span>
                  </div>
                  {path.level && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{path.level}</Badge>
                    </div>
                  )}
                  {path.estimatedHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{path.estimatedHours}h</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/instructor/learning-paths/${path.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Gestionar Ruta
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
