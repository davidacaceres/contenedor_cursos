
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, Play, Award } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  order: number;
  isRequired: boolean;
  isEnrolled: boolean;
  isCompleted: boolean;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

interface LearningPathProgressViewerProps {
  learningPathId: string;
  coursesProgress: CourseProgress[];
  overallProgress: number;
  allRequiredCompleted: boolean;
}

export default function LearningPathProgressViewer({
  learningPathId,
  coursesProgress: initialCoursesProgress,
  overallProgress: initialOverallProgress,
  allRequiredCompleted: initialAllRequiredCompleted,
}: LearningPathProgressViewerProps) {
  const [coursesProgress, setCoursesProgress] = useState(initialCoursesProgress);
  const [overallProgress, setOverallProgress] = useState(initialOverallProgress);
  const [allRequiredCompleted, setAllRequiredCompleted] = useState(initialAllRequiredCompleted);

  const completedCount = coursesProgress.filter(c => c.isCompleted).length;
  const totalCount = coursesProgress.length;

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tu Progreso en la Ruta</CardTitle>
              <CardDescription>
                {completedCount} de {totalCount} cursos completados
              </CardDescription>
            </div>
            {allRequiredCompleted && (
              <Badge variant="default" className="gap-2">
                <Award className="h-4 w-4" />
                ¡Ruta Completada!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso general</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Courses Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos en la Ruta</CardTitle>
          <CardDescription>
            Completa los cursos en el orden recomendado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coursesProgress.map((course, index) => {
              const isAccessible = index === 0 || coursesProgress[index - 1]?.isCompleted;

              return (
                <div
                  key={course.courseId}
                  className={`p-4 border rounded-lg ${
                    !isAccessible && course.isRequired
                      ? 'opacity-50 bg-muted/30'
                      : 'hover:bg-muted/50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {course.isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : isAccessible ? (
                        <Circle className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">
                            #{course.order}
                          </span>
                          <h3 className="font-medium">{course.courseTitle}</h3>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {course.isRequired ? (
                            <Badge variant="default" className="text-xs">
                              Requerido
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Opcional
                            </Badge>
                          )}
                          {course.isCompleted && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completado
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {course.isEnrolled && !course.isCompleted && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                            <span>
                              {course.completedLessons} de {course.totalLessons} lecciones
                            </span>
                            <span>{course.progressPercentage}%</span>
                          </div>
                          <Progress value={course.progressPercentage} className="h-2" />
                        </div>
                      )}

                      {/* Action Button */}
                      <div>
                        {!course.isEnrolled ? (
                          <span className="text-sm text-muted-foreground">
                            Inscríbete en este curso para comenzar
                          </span>
                        ) : course.isCompleted ? (
                          <Link href={`/courses/${course.courseId}`}>
                            <Button variant="outline" size="sm">
                              Revisar Curso
                            </Button>
                          </Link>
                        ) : isAccessible ? (
                          <Link href={`/courses/${course.courseId}`}>
                            <Button size="sm" className="gap-2">
                              <Play className="h-4 w-4" />
                              {course.progressPercentage > 0 ? 'Continuar' : 'Comenzar'}
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Completa el curso anterior para desbloquear
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Card */}
      {allRequiredCompleted && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>¡Felicitaciones!</CardTitle>
                <CardDescription>
                  Has completado todos los cursos requeridos en esta ruta
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href={`/student/learning-paths/${learningPathId}/certificate`}>
              <Button className="w-full">
                Ver Certificado
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
