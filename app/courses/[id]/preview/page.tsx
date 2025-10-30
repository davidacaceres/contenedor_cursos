import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BookOpen,
  Users,
  Clock,
  FileText,
  PlayCircle,
  Info,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CoursePreviewPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      instructor: {
        select: {
          name: true,
          email: true,
        },
      },
      modules: {
        include: {
          lessons: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      lessons: {
        orderBy: {
          order: 'asc',
        },
      },
      assignments: {
        orderBy: {
          dueDate: 'asc',
        },
      },
      enrollments: session.user.role === 'STUDENT' ? {
        where: {
          userId: session.user.id,
        },
      } : undefined,
      _count: {
        select: {
          modules: true,
          lessons: true,
          enrollments: true,
          assignments: true,
        },
      },
    },
  });

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Curso no encontrado</p>
            <Button asChild className="w-full mt-4">
              <Link href={session.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/courses'}>
                Volver
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permissions
  const isInstructor = session.user.role === 'INSTRUCTOR';
  const isOwner = course.instructorId === session.user.id;
  const isEnrolled = course.enrollments && course.enrollments.length > 0;

  // Si no es el instructor propietario y el curso no está publicado, redirect
  if (!isOwner && course.status !== 'PUBLISHED') {
    redirect(session.user.role === 'INSTRUCTOR' ? '/instructor/dashboard' : '/student/courses');
  }

  const calculateTotalDuration = () => {
    const allLessons = [
      ...course.lessons,
      ...course.modules.flatMap(m => m.lessons),
    ];
    const totalMinutes = allLessons.reduce((sum, lesson) => sum + (lesson.duration || 30), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-600">Publicado</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline">Archivado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <Link href={isInstructor ? `/instructor/courses/${course.id}` : '/student/courses'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>

          {/* Preview Alert */}
          {isOwner && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Modo Previsualización</AlertTitle>
              <AlertDescription>
                Estás viendo cómo se verá tu curso para los estudiantes. 
                {course.status !== 'PUBLISHED' && ' Este curso no es visible para los estudiantes aún.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <Card>
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative h-64 bg-gray-200">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-20 w-20 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge()}
                      {isEnrolled && (
                        <Badge className="bg-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {course.title}
                    </h1>

                    <div className="flex items-center text-gray-600 mb-4">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Por {course.instructor.name}</span>
                    </div>

                    <p className="text-gray-600 whitespace-pre-wrap mb-6">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {course._count.modules}
                        </p>
                        <p className="text-sm text-gray-600">Módulos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {course._count.lessons}
                        </p>
                        <p className="text-sm text-gray-600">Lecciones</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {course._count.assignments}
                        </p>
                        <p className="text-sm text-gray-600">Tareas</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {course._count.enrollments}
                        </p>
                        <p className="text-sm text-gray-600">Estudiantes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenido del Curso</CardTitle>
                  <CardDescription>
                    {course._count.modules} módulos • {course._count.lessons} lecciones • {calculateTotalDuration()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module, idx) => (
                        <div key={module.id} className="border rounded-lg">
                          <div className="p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">
                                Módulo {idx + 1}: {module.title}
                              </h4>
                              <span className="text-sm text-gray-600">
                                {module.lessons.length} lecciones
                              </span>
                            </div>
                            {module.description && (
                              <p className="text-sm text-gray-600 mt-2">
                                {module.description}
                              </p>
                            )}
                          </div>
                          {module.lessons.length > 0 && (
                            <ul className="divide-y">
                              {module.lessons.map((lesson) => (
                                <li key={lesson.id} className="p-4 hover:bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <PlayCircle className="h-4 w-4 mr-3 text-blue-600" />
                                      <span className="text-gray-900">{lesson.title}</span>
                                    </div>
                                    {lesson.duration && (
                                      <span className="text-sm text-gray-600 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {lesson.duration} min
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : course.lessons.length > 0 ? (
                    <ul className="divide-y border rounded-lg">
                      {course.lessons.map((lesson) => (
                        <li key={lesson.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <PlayCircle className="h-4 w-4 mr-3 text-blue-600" />
                              <span className="text-gray-900">{lesson.title}</span>
                            </div>
                            {lesson.duration && (
                              <span className="text-sm text-gray-600 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration} min
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No hay contenido disponible aún
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enrollment Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isOwner ? (
                    <>
                      <Button className="w-full" asChild>
                        <Link href={`/instructor/courses/${course.id}`}>
                          Gestionar Curso
                        </Link>
                      </Button>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/instructor/courses/${course.id}/content`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Editar Contenido
                        </Link>
                      </Button>
                    </>
                  ) : isEnrolled ? (
                    <Button className="w-full" asChild>
                      <Link href={`/student/courses/${course.id}/content`}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Ir al Curso
                      </Link>
                    </Button>
                  ) : course.status === 'PUBLISHED' ? (
                    <Button className="w-full">Inscribirse</Button>
                  ) : null}
                </CardContent>
              </Card>

              {/* Instructor Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900">{course.instructor.name}</p>
                  <p className="text-sm text-gray-600">{course.instructor.email}</p>
                </CardContent>
              </Card>

              {/* Assignments */}
              {course.assignments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Tareas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">
                      Este curso incluye {course.assignments.length} tarea(s) para completar
                    </p>
                    <ul className="space-y-2">
                      {course.assignments.slice(0, 3).map((assignment) => (
                        <li key={assignment.id} className="text-sm">
                          <p className="font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-gray-600">
                            Tipo: {assignment.type === 'MULTIPLE_CHOICE' ? 'Opción múltiple' : 'Archivo'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
