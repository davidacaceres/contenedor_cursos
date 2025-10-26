
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { CheckCircle2, Circle, PlayCircle, FileText, Link as LinkIcon, FileQuestion, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  type: string;
  videoUrl?: string;
  pdfUrl?: string;
  externalUrl?: string;
  order: number;
  duration?: number;
}

interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  lessons: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt: string | null;
  }>;
}

export function CourseContentViewer({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchModules();
    fetchProgress();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
        if (data.length > 0 && data[0].lessons.length > 0) {
          setSelectedLesson(data[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error('Error al obtener módulos:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/course/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error al obtener progreso:', error);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    if (!progress) return false;
    return progress.lessons.find(l => l.id === lessonId)?.completed || false;
  };

  const markLessonComplete = async (lessonId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/progress/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId })
      });

      if (response.ok) {
        toast.success('¡Lección marcada como completada!');
        fetchProgress();
      } else {
        toast.error('Error al marcar lección como completada');
      }
    } catch (error) {
      toast.error('Error al actualizar progreso');
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <PlayCircle className="h-4 w-4" />;
      case 'TEXT': return <FileText className="h-4 w-4" />;
      case 'EXTERNAL_LINK': return <LinkIcon className="h-4 w-4" />;
      case 'QUIZ': return <FileQuestion className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderLessonContent = () => {
    if (!selectedLesson) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          Selecciona una lección para comenzar
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getLessonIcon(selectedLesson.type)}
            <h3 className="text-xl font-semibold">{selectedLesson.title}</h3>
          </div>
          {selectedLesson.duration && (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {selectedLesson.duration} min
            </Badge>
          )}
        </div>

        {selectedLesson.type === 'TEXT' && (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap">{selectedLesson.content}</div>
          </div>
        )}

        {selectedLesson.type === 'VIDEO' && selectedLesson.videoUrl && (
          <div className="aspect-video">
            <iframe
              src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        )}

        {selectedLesson.type === 'PDF' && selectedLesson.pdfUrl && (
          <div className="aspect-[8.5/11]">
            <iframe
              src={selectedLesson.pdfUrl}
              className="w-full h-full rounded-lg border"
            />
          </div>
        )}

        {selectedLesson.type === 'EXTERNAL_LINK' && selectedLesson.externalUrl && (
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">Este contenido se encuentra en un sitio externo.</p>
              <Button
                onClick={() => window.open(selectedLesson.externalUrl, '_blank')}
              >
                Abrir Enlace Externo
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedLesson.type === 'QUIZ' && (
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">Esta lección contiene un quiz evaluativo.</p>
              <Button
                onClick={() => router.push(`/student/courses/${courseId}/quiz/${selectedLesson.id}`)}
              >
                Iniciar Quiz
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          {!isLessonCompleted(selectedLesson.id) ? (
            <Button
              onClick={() => markLessonComplete(selectedLesson.id)}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Marcar como Completada'}
            </Button>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Completada
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Barra lateral con módulos y lecciones */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Contenido del Curso</CardTitle>
            {progress && (
              <div className="space-y-2">
                <Progress value={progress.percentage} />
                <p className="text-sm text-muted-foreground">
                  {progress.completedLessons} de {progress.totalLessons} lecciones completadas
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {modules.map((module) => (
                <AccordionItem key={module.id} value={module.id} className="border-b-0 px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left">
                      <div className="font-medium text-sm">{module.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {module.lessons.filter(l => isLessonCompleted(l.id)).length}/{module.lessons.length} completadas
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`w-full text-left p-2 rounded text-sm flex items-center gap-2 hover:bg-muted transition-colors ${
                            selectedLesson?.id === lesson.id ? 'bg-muted' : ''
                          }`}
                        >
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          {getLessonIcon(lesson.type)}
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.duration}m
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Área de contenido principal */}
      <div className="md:col-span-2">
        <Card>
          <CardContent className="pt-6">
            {renderLessonContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
