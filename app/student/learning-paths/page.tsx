
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LearningPathCatalog from '@/components/student/learning-path-catalog';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default async function StudentLearningPathsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/auth/signin');
  }

  // Get all published learning paths
  const publishedPaths = await prisma.learningPath.findMany({
    where: {
      isPublished: true,
    },
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
      courses: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get user's enrolled learning paths
  const enrolledPaths = await prisma.learningPathEnrollment.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      learningPath: {
        include: {
          instructor: {
            select: {
              name: true,
            },
          },
          courses: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  lessons: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  });

  // Calculate progress for enrolled paths
  const enrolledPathsWithProgress = await Promise.all(
    enrolledPaths.map(async (enrollment) => {
      const path = enrollment.learningPath;
      const totalCourses = path.courses.length;
      
      // Count completed courses
      let completedCourses = 0;
      for (const lpc of path.courses) {
        const courseEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: lpc.courseId,
            },
          },
        });
        if (courseEnrollment?.completedAt) {
          completedCourses++;
        }
      }

      const progressPercentage = totalCourses > 0 
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

      return {
        ...path,
        enrollment,
        completedCourses,
        totalCourses,
        progressPercentage,
      };
    })
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rutas de Aprendizaje</h1>
        <p className="text-muted-foreground">
          Explora rutas estructuradas para desarrollar tus habilidades profesionales
        </p>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList>
          <TabsTrigger value="explore">
            <TrendingUp className="mr-2 h-4 w-4" />
            Explorar Rutas
          </TabsTrigger>
          <TabsTrigger value="enrolled">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mis Rutas ({enrolledPaths.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore">
          <LearningPathCatalog learningPaths={publishedPaths} />
        </TabsContent>

        <TabsContent value="enrolled">
          {enrolledPathsWithProgress.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No estás inscrito en ninguna ruta</h2>
                <p className="text-muted-foreground text-center mb-4">
                  Explora las rutas disponibles y comienza tu viaje de aprendizaje
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledPathsWithProgress.map((path) => (
                <Card key={path.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {path.thumbnail && (
                      <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={path.thumbnail}
                          alt={path.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {path.description}
                    </p>

                    <div className="space-y-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-semibold">{path.progressPercentage}%</span>
                        </div>
                        <Progress value={path.progressPercentage} className="h-2" />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {path.completedCourses} de {path.totalCourses} cursos completados
                      </div>
                    </div>

                    <Link href={`/student/learning-paths/${path.id}`}>
                      <Button className="w-full">
                        {path.progressPercentage === 100 ? 'Ver Certificado' : 'Continuar Aprendiendo'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
