
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, GripVertical, FileVideo, FileText, Link as LinkIcon, FileQuestion } from 'lucide-react';

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

export function ModuleLessonManager({ courseId }: { courseId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);

  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    type: 'TEXT',
    videoUrl: '',
    pdfUrl: '',
    externalUrl: '',
    duration: 0
  });

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Error al obtener módulos:', error);
    }
  };

  const handleCreateModule = async () => {
    if (!moduleForm.title.trim()) {
      toast.error('El título del módulo es requerido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, ...moduleForm })
      });

      if (response.ok) {
        toast.success('Módulo creado exitosamente');
        setIsModuleDialogOpen(false);
        setModuleForm({ title: '', description: '' });
        fetchModules();
      } else {
        toast.error('Error al crear módulo');
      }
    } catch (error) {
      toast.error('Error al crear módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleForm)
      });

      if (response.ok) {
        toast.success('Módulo actualizado exitosamente');
        setIsModuleDialogOpen(false);
        setEditingModule(null);
        setModuleForm({ title: '', description: '' });
        fetchModules();
      } else {
        toast.error('Error al actualizar módulo');
      }
    } catch (error) {
      toast.error('Error al actualizar módulo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo? Se eliminarán todas sus lecciones.')) {
      return;
    }

    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Módulo eliminado exitosamente');
        fetchModules();
      } else {
        toast.error('Error al eliminar módulo');
      }
    } catch (error) {
      toast.error('Error al eliminar módulo');
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedModuleId || !lessonForm.title.trim()) {
      toast.error('Selecciona un módulo y proporciona un título');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/courses/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId, 
          moduleId: selectedModuleId,
          ...lessonForm 
        })
      });

      if (response.ok) {
        toast.success('Lección creada exitosamente');
        setIsLessonDialogOpen(false);
        setLessonForm({
          title: '',
          content: '',
          type: 'TEXT',
          videoUrl: '',
          pdfUrl: '',
          externalUrl: '',
          duration: 0
        });
        fetchModules();
      } else {
        toast.error('Error al crear lección');
      }
    } catch (error) {
      toast.error('Error al crear lección');
    } finally {
      setLoading(false);
    }
  };

  const openModuleDialog = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({ title: module.title, description: module.description || '' });
    } else {
      setEditingModule(null);
      setModuleForm({ title: '', description: '' });
    }
    setIsModuleDialogOpen(true);
  };

  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        content: lesson.content || '',
        type: lesson.type,
        videoUrl: lesson.videoUrl || '',
        pdfUrl: lesson.pdfUrl || '',
        externalUrl: lesson.externalUrl || '',
        duration: lesson.duration || 0
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        content: '',
        type: 'TEXT',
        videoUrl: '',
        pdfUrl: '',
        externalUrl: '',
        duration: 0
      });
    }
    setIsLessonDialogOpen(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <FileVideo className="h-4 w-4" />;
      case 'TEXT': return <FileText className="h-4 w-4" />;
      case 'EXTERNAL_LINK': return <LinkIcon className="h-4 w-4" />;
      case 'QUIZ': return <FileQuestion className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estructura del Curso</h2>
        <Button onClick={() => openModuleDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay módulos aún. Crea el primer módulo para comenzar.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {modules.map((module) => (
            <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium">{module.title}</div>
                      {module.description && (
                        <div className="text-sm text-muted-foreground">{module.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModuleDialog(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openLessonDialog(module.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Lección
                  </Button>
                  
                  {module.lessons.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No hay lecciones en este módulo
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            {getLessonIcon(lesson.type)}
                            <span className="text-sm">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">
                                ({lesson.duration} min)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Dialog para crear/editar módulo */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
            <DialogDescription>
              {editingModule ? 'Actualiza la información del módulo' : 'Crea un nuevo módulo para organizar tus lecciones'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Título</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="ej. Introducción a React"
              />
            </div>
            <div>
              <Label htmlFor="module-description">Descripción (opcional)</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Describe brevemente el contenido del módulo"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModuleDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingModule ? handleUpdateModule : handleCreateModule}
                disabled={loading}
              >
                {loading ? 'Guardando...' : editingModule ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear lección */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Lección</DialogTitle>
            <DialogDescription>
              Crea una nueva lección para el módulo seleccionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Título</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="ej. Introducción a los Hooks"
              />
            </div>
            <div>
              <Label htmlFor="lesson-type">Tipo de Lección</Label>
              <Select
                value={lessonForm.type}
                onValueChange={(value) => setLessonForm({ ...lessonForm, type: value })}
              >
                <SelectTrigger id="lesson-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Texto</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXTERNAL_LINK">Enlace Externo</SelectItem>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {lessonForm.type === 'TEXT' && (
              <div>
                <Label htmlFor="lesson-content">Contenido</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Escribe el contenido de la lección"
                  rows={8}
                />
              </div>
            )}

            {lessonForm.type === 'VIDEO' && (
              <div>
                <Label htmlFor="video-url">URL del Video</Label>
                <Input
                  id="video-url"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            )}

            {lessonForm.type === 'PDF' && (
              <div>
                <Label htmlFor="pdf-url">URL del PDF</Label>
                <Input
                  id="pdf-url"
                  value={lessonForm.pdfUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                />
              </div>
            )}

            {lessonForm.type === 'EXTERNAL_LINK' && (
              <div>
                <Label htmlFor="external-url">URL Externa</Label>
                <Input
                  id="external-url"
                  value={lessonForm.externalUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            )}

            <div>
              <Label htmlFor="lesson-duration">Duración (minutos)</Label>
              <Input
                id="lesson-duration"
                type="number"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsLessonDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateLesson} disabled={loading}>
                {loading ? 'Creando...' : 'Crear Lección'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
