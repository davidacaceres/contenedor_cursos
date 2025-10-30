import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CoursePublicationManager } from '@/components/instructor/course-publication-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, Edit, Settings, BarChart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'INSTRUCTOR') {
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
          lessons: true,
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
          createdAt: 'desc',
        },
      },
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

  if (!course || course.instructorId !== session.user.id) {
    redirect('/instructor/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {course.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión y configuración del curso
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/instructor/dashboard">
                  Volver al Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Publication Manager */}
              <CoursePublicationManager 
                courseId={course.id} 
                currentStatus={course.status}
              />

              {/* Course Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Curso</CardTitle>
                  <CardDescription>Información general del curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.thumbnail && (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Creado</p>
                      <p className="text-gray-900">
                        {new Date(course.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última actualización</p>
                      <p className="text-gray-900">
                        {new Date(course.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Contenido del Curso</CardTitle>
                  <CardDescription>
                    Vista general de módulos y lecciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module, idx) => (
                        <div key={module.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              Módulo {idx + 1}: {module.title}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {module.lessons.length} lecciones
                            </span>
                          </div>
                          {module.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {module.description}
                            </p>
                          )}
                          {module.lessons.length > 0 && (
                            <ul className="space-y-1 ml-4">
                              {module.lessons.map((lesson) => (
                                <li key={lesson.id} className="text-sm text-gray-600 flex items-center">
                                  <BookOpen className="h-3 w-3 mr-2" />
                                  {lesson.title}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : course.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {course.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center p-3 border rounded-lg">
                          <BookOpen className="h-4 w-4 mr-3 text-blue-600" />
                          <span className="text-gray-900">{lesson.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-600">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No hay contenido aún. Agrega módulos y lecciones para comenzar.</p>
                      <Button asChild className="mt-4">
                        <Link href={`/instructor/courses/${course.id}/content`}>
                          Agregar Contenido
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href={`/instructor/courses/${course.id}/content`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Gestionar Contenido
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/instructor/courses/${course.id}/analytics`}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Ver Analíticas
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/instructor/courses/${course.id}/assignments`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Gestionar Tareas
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/instructor/courses/${course.id}/students`}>
                      <Users className="h-4 w-4 mr-2" />
                      Ver Estudiantes
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/instructor/courses/${course.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Información
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/instructor/courses/${course.id}/settings`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle>Tareas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.assignments.length > 0 ? (
                    <div className="space-y-3">
                      {course.assignments.slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="text-sm">
                          <p className="font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-gray-600">
                            Vence: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No hay tareas aún</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
