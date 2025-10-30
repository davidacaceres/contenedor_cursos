
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  GripVertical,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Course {
  id: string;
  title: string;
  thumbnail?: string | null;
  description: string;
}

interface LearningPathCourse {
  id: string;
  courseId: string;
  order: number;
  isRequired: boolean;
  course: Course;
}

interface LearningPathCourseManagerProps {
  learningPathId: string;
  initialCourses: LearningPathCourse[];
}

export default function LearningPathCourseManager({
  learningPathId,
  initialCourses,
}: LearningPathCourseManagerProps) {
  const [courses, setCourses] = useState<LearningPathCourse[]>(initialCourses);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await fetch('/api/courses?instructorOnly=true');
      if (!response.ok) throw new Error('Error al cargar cursos');
      
      const data = await response.json();
      // Filter out courses already in the learning path
      const existingCourseIds = courses.map(c => c.courseId);
      const filtered = data.courses.filter((course: Course) => !existingCourseIds.includes(course.id));
      setAvailableCourses(filtered);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Error al cargar los cursos disponibles');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleAddCourse = async () => {
    if (!selectedCourseId) {
      toast.error('Selecciona un curso');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/learning-paths/${learningPathId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          isRequired,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al agregar el curso');
      }

      const data = await response.json();
      setCourses([...courses, data.learningPathCourse]);
      setSelectedCourseId('');
      setIsRequired(true);
      fetchAvailableCourses();
      toast.success('Curso agregado exitosamente');
    } catch (error: any) {
      console.error('Error adding course:', error);
      toast.error(error.message || 'Error al agregar el curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(
        `/api/learning-paths/${learningPathId}/courses/${courseId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el curso');
      }

      setCourses(courses.filter(c => c.courseId !== courseId));
      fetchAvailableCourses();
      toast.success('Curso eliminado de la ruta');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Error al eliminar el curso');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newCourses = [...courses];
    const draggedCourse = newCourses[draggedItem];
    newCourses.splice(draggedItem, 1);
    newCourses.splice(index, 0, draggedCourse);

    setCourses(newCourses);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem === null) return;

    // Update order in backend
    const courseOrders = courses.map((course, index) => ({
      id: course.id,
      order: index + 1,
    }));

    try {
      const response = await fetch(`/api/learning-paths/${learningPathId}/courses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseOrders }),
      });

      if (!response.ok) throw new Error('Error al actualizar el orden');
      
      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
      // Reload to get correct order
      window.location.reload();
    }

    setDraggedItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Course Section */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Curso a la Ruta</CardTitle>
          <CardDescription>
            Selecciona un curso de tu catálogo para agregarlo a esta ruta de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isLoadingCourses}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="required">Requerido</Label>
            </div>
          </div>

          <Button
            onClick={handleAddCourse}
            disabled={!selectedCourseId || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Agregar Curso
          </Button>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Cursos en la Ruta ({courses.length})</CardTitle>
          <CardDescription>
            Arrastra para reordenar los cursos en la secuencia de aprendizaje
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No hay cursos en esta ruta aún</p>
              <p className="text-sm">Agrega cursos arriba para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-move transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  
                  <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground w-8">
                    #{index + 1}
                  </div>

                  {item.course.thumbnail && (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.course.thumbnail}
                        alt={item.course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.course.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isRequired ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Requerido
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        Opcional
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCourseToDelete(item.courseId);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso de la ruta?</AlertDialogTitle>
            <AlertDialogDescription>
              Este curso será removido de la ruta de aprendizaje. Los estudiantes ya inscritos
              mantendrán su acceso al curso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (courseToDelete) {
                  handleDeleteCourse(courseToDelete);
                  setDeleteDialogOpen(false);
                  setCourseToDelete(null);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
