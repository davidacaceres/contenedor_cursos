
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  BarChart,
  Route
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InstructorDashboardProps {
  instructor: any;
}

export function InstructorDashboard({ instructor }: InstructorDashboardProps) {
  const courses = instructor?.coursesCreated || [];
  const learningPaths = instructor?.learningPathsCreated || [];
  const totalStudents = courses.reduce((sum: number, course: any) => sum + (course._count?.enrollments || 0), 0);
  const totalLessons = courses.reduce((sum: number, course: any) => sum + (course._count?.lessons || 0), 0);

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard del Instructor
          </h1>
          <p className="text-gray-600">
            Bienvenido, {instructor?.name}. Gestiona tus cursos y estudiantes desde aquí.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos creados</p>
                  <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                  <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lecciones</p>
                  <p className="text-3xl font-bold text-purple-600">{totalLessons}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rutas de Aprendizaje</p>
                  <p className="text-3xl font-bold text-yellow-600">{learningPaths.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Route className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tus Cursos</CardTitle>
                  <CardDescription>
                    Gestiona y crea nuevos cursos para tus estudiantes
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/instructor/courses/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Curso
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.length > 0 ? (
                  courses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <FileText className="h-4 w-4 mr-1" />
                              {course._count?.lessons || 0} lecciones
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-1" />
                              {course._count?.enrollments || 0} estudiantes
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {course.status === 'PUBLISHED' && (
                          <Badge className="bg-green-600 hover:bg-green-700">Publicado</Badge>
                        )}
                        {course.status === 'DRAFT' && (
                          <Badge variant="secondary">Borrador</Badge>
                        )}
                        {course.status === 'ARCHIVED' && (
                          <Badge variant="outline">Archivado</Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/analytics`}>
                                <BarChart className="h-4 w-4 mr-2" />
                                Ver analíticas
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar curso
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/content`}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Gestionar contenido
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/assignments`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Gestionar tareas
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/instructor/courses/${course.id}/students`}>
                                <Users className="h-4 w-4 mr-2" />
                                Ver estudiantes
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes cursos aún
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Crea tu primer curso para comenzar a enseñar
                    </p>
                    <Button asChild>
                      <Link href="/instructor/courses/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Primer Curso
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.length > 0 ? (
                  <>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Curso creado</p>
                      <p className="text-gray-600">
                        {courses[0]?.title} - hace {Math.floor((Date.now() - new Date(courses[0]?.createdAt).getTime()) / (1000 * 60 * 60 * 24))} días
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Nuevos estudiantes</p>
                      <p className="text-gray-600">
                        {totalStudents} estudiantes inscritos en total
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    No hay actividad reciente. ¡Crea tu primer curso para comenzar!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/instructor/courses/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Curso
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/instructor/learning-paths/create">
                    <Route className="h-4 w-4 mr-2" />
                    Crear Ruta de Aprendizaje
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/instructor/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Estadísticas
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/instructor/students">
                    <Users className="h-4 w-4 mr-2" />
                    Gestionar Estudiantes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
