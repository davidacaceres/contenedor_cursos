
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearningPathForm from '@/components/instructor/learning-path-form';
import LearningPathCourseManager from '@/components/instructor/learning-path-course-manager';
import { ArrowLeft, Users, BookOpen, Clock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default async function InstructorLearningPathDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'INSTRUCTOR') {
    redirect('/auth/signin');
  }

  const learningPath = await prisma.learningPath.findUnique({
    where: {
      id: params.id,
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              status: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!learningPath) {
    notFound();
  }

  // Verify ownership
  if (learningPath.instructorId !== session.user.id) {
    redirect('/instructor/learning-paths');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/instructor/learning-paths">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Rutas
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{learningPath.title}</h1>
              {learningPath.isPublished ? (
                <Badge variant="default" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Publicada
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <EyeOff className="h-3 w-3" />
                  Borrador
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{learningPath.description}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{learningPath.courses.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{learningPath._count.enrollments}</span>
            </div>
          </CardContent>
        </Card>

        {learningPath.level && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nivel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-base">
                {learningPath.level}
              </Badge>
            </CardContent>
          </Card>
        )}

        {learningPath.estimatedHours && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Duración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{learningPath.estimatedHours}h</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="edit">Editar Información</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <LearningPathCourseManager
            learningPathId={params.id}
            initialCourses={learningPath.courses}
          />
        </TabsContent>

        <TabsContent value="edit">
          <LearningPathForm learningPath={learningPath} mode="edit" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
