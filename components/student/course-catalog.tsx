
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Users,
  Clock,
  Search,
  Filter,
  User,
  CheckCircle,
  Play,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseCatalogProps {
  courses: any[];
  userId: string;
}

export function CourseCatalog({ courses, userId }: CourseCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  // Filtrar cursos por búsqueda
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = async (courseId: string) => {
    setIsEnrolling(courseId);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo inscribir al curso',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '¡Inscripción exitosa!',
          description: 'Te has inscrito correctamente al curso',
        });
        // Recargar la página para actualizar el estado
        window.location.reload();
      }
    } catch (error) {
      console.error('Error en inscripción:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al inscribirte al curso',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(null);
    }
  };

  const calculateTotalDuration = (lessons: any[]) => {
    const totalMinutes = lessons.reduce((sum, lesson) => sum + (lesson.duration || 30), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Catálogo de Cursos
          </h1>
          <p className="text-gray-600">
            Descubre nuevos cursos y expande tus conocimientos
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cursos, instructores o temas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = course.enrollments.length > 0;
              const totalDuration = calculateTotalDuration(course.lessons);
              
              return (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Course Image */}
                  <div className="relative h-48 bg-gray-200">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    {isEnrolled && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Inscrito
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{course.instructor?.name}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3 mb-4">
                      {course.description}
                    </CardDescription>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course._count?.lessons || 0} lecciones</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{totalDuration}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course._count?.enrollments || 0}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-2">
                      {isEnrolled ? (
                        <Button asChild className="flex-1">
                          <Link href={`/student/courses/${course.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continuar
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          disabled={isEnrolling === course.id}
                          className="flex-1"
                        >
                          {isEnrolling === course.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Inscribiendo...
                            </>
                          ) : (
                            'Inscribirse'
                          )}
                        </Button>
                      )}
                      <Button variant="outline" asChild>
                        <Link href={`/courses/${course.id}/preview`}>
                          Ver detalles
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron cursos
              </h3>
              <p className="text-gray-600 text-center max-w-md">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda o explora todas las categorías disponibles.'
                  : 'Actualmente no hay cursos disponibles. ¡Vuelve pronto para descubrir nuevos contenidos!'
                }
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-4"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
