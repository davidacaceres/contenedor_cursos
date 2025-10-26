
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
  Play,
  Award,
  Clock,
  TrendingUp,
  User,
  CheckCircle,
  Search,
  Calendar,
  FileText
} from 'lucide-react';

interface StudentDashboardProps {
  student: any;
}

export function StudentDashboard({ student }: StudentDashboardProps) {
  const enrollments = student?.enrollments || [];
  const progress = student?.progress || [];
  const quizResults = student?.quizResults || [];

  // Calcular estadísticas
  const totalCourses = enrollments.length;
  const completedLessons = progress.filter((p: any) => p.completed).length;
  const totalLessons = enrollments.reduce((sum: number, enrollment: any) => 
    sum + (enrollment.course._count?.lessons || 0), 0
  );
  const averageScore = quizResults.length > 0 
    ? Math.round(quizResults.reduce((sum: number, result: any) => sum + result.score, 0) / quizResults.length)
    : 0;

  // Calcular progreso de cada curso
  const coursesWithProgress = enrollments.map((enrollment: any) => {
    const courseProgress = progress.filter((p: any) => 
      p.lesson.courseId === enrollment.course.id
    );
    const completedInCourse = courseProgress.filter((p: any) => p.completed).length;
    const totalInCourse = enrollment.course._count?.lessons || 0;
    const progressPercentage = totalInCourse > 0 
      ? Math.round((completedInCourse / totalInCourse) * 100) 
      : 0;
    
    return {
      ...enrollment,
      progressPercentage,
      completedLessons: completedInCourse,
      totalLessons: totalInCourse,
    };
  });

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Panel de Aprendizaje
          </h1>
          <p className="text-gray-600">
            Bienvenido, {student?.name}. Continúa tu viaje de aprendizaje desde aquí.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos inscritos</p>
                  <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
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
                  <p className="text-sm font-medium text-gray-600">Lecciones completadas</p>
                  <p className="text-3xl font-bold text-green-600">{completedLessons}</p>
                  {totalLessons > 0 && (
                    <p className="text-xs text-gray-500">de {totalLessons} total</p>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio evaluaciones</p>
                  <p className="text-3xl font-bold text-purple-600">{averageScore}%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progreso general</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mis Cursos</CardTitle>
                  <CardDescription>
                    Continúa tu aprendizaje donde lo dejaste
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/student/courses">
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesWithProgress.length > 0 ? (
                  coursesWithProgress.map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-200">
                          {enrollment.course.thumbnail ? (
                            <Image
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{enrollment.course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Instructor: {enrollment.course.instructor?.name}
                          </p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {enrollment.completedLessons} de {enrollment.totalLessons} lecciones
                              </span>
                              <span className="font-medium text-gray-900">
                                {enrollment.progressPercentage}%
                              </span>
                            </div>
                            <Progress value={enrollment.progressPercentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button asChild size="sm">
                          <Link href={`/student/courses/${enrollment.course.id}/content`}>
                            {enrollment.progressPercentage === 0 ? 'Comenzar' : 'Continuar'}
                            <Play className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes cursos inscritos
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Explora nuestro catálogo y encuentra el curso perfecto para ti
                    </p>
                    <Button asChild>
                      <Link href="/student/courses">
                        <Search className="h-4 w-4 mr-2" />
                        Explorar Cursos
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Evaluaciones Recientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizResults.length > 0 ? (
                  quizResults.slice(0, 3).map((result: any) => (
                    <div key={result.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{result.quiz?.title}</p>
                        <Badge variant={result.score >= 70 ? 'default' : 'destructive'}>
                          {result.score}%
                        </Badge>
                      </div>
                      <p className="text-gray-600">
                        {result.quiz?.lesson?.course?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">
                    No tienes evaluaciones completadas aún
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Aprendizaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tiempo estudiando</span>
                  <span className="text-sm font-medium">
                    {Math.ceil((completedLessons * 30) / 60)}h {((completedLessons * 30) % 60)}min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Evaluaciones realizadas</span>
                  <span className="text-sm font-medium">{quizResults.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Racha actual</span>
                  <span className="text-sm font-medium">
                    {Math.floor(Math.random() * 7) + 1} días
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/student/courses">
                    <Search className="h-4 w-4 mr-2" />
                    Explorar Cursos
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/student/assignments">
                    <FileText className="h-4 w-4 mr-2" />
                    Mis Tareas
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/student/progress">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Progreso Detallado
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/student/certificates">
                    <Award className="h-4 w-4 mr-2" />
                    Mis Certificados
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
