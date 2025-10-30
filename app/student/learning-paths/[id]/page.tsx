
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Clock, Award, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LearningPathProgressViewer from '@/components/student/learning-path-progress-viewer';
import { toast } from 'react-hot-toast';

async function enrollInPath(pathId: string, userId: string) {
  'use server';
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/learning-paths/${pathId}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error enrolling:', error);
    return false;
  }
}

export default async function StudentLearningPathDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/auth/signin');
  }

  const learningPath = await prisma.learningPath.findUnique({
    where: {
      id: params.id,
    },
    include: {
      instructor: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      courses: {
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  name: true,
                },
              },
              _count: {
                select: {
                  lessons: true,
                  enrollments: true,
                },
              },
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

  if (!learningPath || !learningPath.isPublished) {
    notFound();
  }

  // Check if user is enrolled
  const enrollment = await prisma.learningPathEnrollment.findUnique({
    where: {
      userId_learningPathId: {
        userId: session.user.id,
        learningPathId: params.id,
      },
    },
  });

  const isEnrolled = !!enrollment;

  // Get progress if enrolled
  let progressData = null;
  if (isEnrolled) {
    const coursesProgress = await Promise.all(
      learningPath.courses.map(async (lpc) => {
        const course = lpc.course;
        
        const courseEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId: course.id,
            },
          },
        });

        const lessons = await prisma.lesson.findMany({
          where: { courseId: course.id },
        });

        const completedLessons = await prisma.progress.count({
          where: {
            userId: session.user.id,
            lessonId: { in: lessons.map(l => l.id) },
            completed: true,
          },
        });

        const totalLessons = lessons.length;
        const progressPercentage = totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          order: lpc.order,
          isRequired: lpc.isRequired,
          isEnrolled: !!courseEnrollment,
          isCompleted: courseEnrollment?.completedAt !== null,
          totalLessons,
          completedLessons,
          progressPercentage,
        };
      })
    );

    const totalCourses = learningPath.courses.length;
    const completedCourses = coursesProgress.filter(c => c.isCompleted).length;
    const overallProgress = totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

    const allRequiredCompleted = coursesProgress
      .filter(c => c.isRequired)
      .every(c => c.isCompleted);

    progressData = {
      coursesProgress,
      overallProgress,
      allRequiredCompleted,
    };
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Back Button */}
      <Link href="/student/learning-paths">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Rutas
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {learningPath.thumbnail && (
                <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={learningPath.thumbnail}
                    alt={learningPath.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardTitle className="text-3xl">{learningPath.title}</CardTitle>
              <CardDescription className="text-base">
                {learningPath.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {learningPath.level && (
                  <Badge variant="secondary" className="text-sm">
                    {learningPath.level}
                  </Badge>
                )}
                {isEnrolled && (
                  <Badge variant="default" className="text-sm gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Inscrito
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cursos</p>
                <p className="font-semibold">{learningPath.courses.length} cursos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="font-semibold">{learningPath._count.enrollments} inscritos</p>
              </div>
            </div>

            {learningPath.estimatedHours && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-semibold">~{learningPath.estimatedHours} horas</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Instructor</p>
              <div className="flex items-center gap-2">
                {learningPath.instructor.image && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted">
                    <img
                      src={learningPath.instructor.image}
                      alt={learningPath.instructor.name || ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="font-semibold">{learningPath.instructor.name}</p>
              </div>
            </div>

            {!isEnrolled && (
              <form action={`/api/learning-paths/${params.id}/enroll`} method="POST">
                <Button type="submit" className="w-full mt-4">
                  Inscribirse en esta Ruta
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress or Course List */}
      {isEnrolled && progressData ? (
        <LearningPathProgressViewer
          learningPathId={params.id}
          coursesProgress={progressData.coursesProgress}
          overallProgress={progressData.overallProgress}
          allRequiredCompleted={progressData.allRequiredCompleted}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cursos en esta Ruta</CardTitle>
            <CardDescription>
              Esta ruta incluye {learningPath.courses.length} cursos en secuencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {learningPath.courses.map((lpc, index) => (
                <div
                  key={lpc.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {lpc.order}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-medium">{lpc.course.title}</h3>
                      {lpc.isRequired ? (
                        <Badge variant="default" className="text-xs flex-shrink-0">
                          Requerido
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          Opcional
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{lpc.course._count.lessons} lecciones</span>
                      <span>•</span>
                      <span>Por {lpc.course.instructor.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
