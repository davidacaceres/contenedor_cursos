
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Users, Edit, Trash2, CheckCircle2, XCircle, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Assignment = {
  id: string;
  title: string;
  description: string;
  type: string;
  maxScore: number;
  dueDate: string | null;
  isAutoGraded: boolean;
  questionsData?: any[];
  createdAt: string;
  submissions: any[];
  lesson?: {
    title: string;
  };
};

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type RubricCriterion = {
  name: string;
  description: string;
  points: number;
};

export default function CourseAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRubricDialogOpen, setIsRubricDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'HOMEWORK',
    maxScore: 100,
    dueDate: '',
    isAutoGraded: false,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([
    { name: '', description: '', points: 0 },
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'INSTRUCTOR') {
      router.push('/');
      return;
    }
    if (params.id) {
      fetchAssignments();
    }
  }, [params.id, session, status, router]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`/api/assignments?courseId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('La pregunta no puede estar vacía');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Todas las opciones deben tener contenido');
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
    });
    toast.success('Pregunta agregada');
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isAutoGraded && questions.length === 0) {
      toast.error('Las tareas auto-calificadas deben tener al menos una pregunta');
      return;
    }

    try {
      const questionsData = formData.isAutoGraded
        ? questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          }))
        : null;

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: params.id,
          questionsData,
        }),
      });

      if (res.ok) {
        toast.success('Tarea creada exitosamente');
        setIsDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          type: 'HOMEWORK',
          maxScore: 100,
          dueDate: '',
          isAutoGraded: false,
        });
        setQuestions([]);
        fetchAssignments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al crear tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la tarea');
    }
  };

  const handleCreateRubric = async () => {
    if (!selectedAssignment) return;

    const totalPoints = rubricCriteria.reduce((sum, c) => sum + c.points, 0);
    const assignment = assignments.find(a => a.id === selectedAssignment);

    if (totalPoints !== assignment?.maxScore) {
      toast.error(`Los puntos deben sumar ${assignment?.maxScore}`);
      return;
    }

    if (rubricCriteria.some(c => !c.name.trim() || !c.description.trim())) {
      toast.error('Todos los criterios deben tener nombre y descripción');
      return;
    }

    try {
      const res = await fetch('/api/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment,
          criteriaData: rubricCriteria,
        }),
      });

      if (res.ok) {
        toast.success('Rúbrica creada exitosamente');
        setIsRubricDialogOpen(false);
        setSelectedAssignment(null);
        setRubricCriteria([{ name: '', description: '', points: 0 }]);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al crear rúbrica');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la rúbrica');
    }
  };

  const addCriterion = () => {
    setRubricCriteria([...rubricCriteria, { name: '', description: '', points: 0 }]);
  };

  const removeCriterion = (index: number) => {
    if (rubricCriteria.length > 1) {
      setRubricCriteria(rubricCriteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, field: keyof RubricCriterion, value: any) => {
    const updated = [...rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setRubricCriteria(updated);
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Tarea eliminada');
        fetchAssignments();
      } else {
        toast.error('Error al eliminar la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM': return 'bg-red-100 text-red-800';
      case 'PROJECT': return 'bg-purple-100 text-purple-800';
      case 'ESSAY': return 'bg-blue-100 text-blue-800';
      case 'MULTIPLE_CHOICE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HOMEWORK: 'Tarea',
      EXAM: 'Examen',
      PROJECT: 'Proyecto',
      ESSAY: 'Ensayo',
      MULTIPLE_CHOICE: 'Opción Múltiple',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tareas del Curso</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las tareas, exámenes y proyectos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
              <DialogDescription>
                Completa los detalles de la tarea
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Información Básica</TabsTrigger>
                  <TabsTrigger value="questions" disabled={!formData.isAutoGraded}>
                    Preguntas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOMEWORK">Tarea</SelectItem>
                          <SelectItem value="EXAM">Examen</SelectItem>
                          <SelectItem value="PROJECT">Proyecto</SelectItem>
                          <SelectItem value="ESSAY">Ensayo</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Opción Múltiple</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxScore">Puntuación Máxima</Label>
                      <Input
                        id="maxScore"
                        type="number"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Entrega</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAutoGraded"
                      checked={formData.isAutoGraded}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isAutoGraded: checked as boolean })
                      }
                    />
                    <Label htmlFor="isAutoGraded" className="cursor-pointer">
                      Calificación automática (opción múltiple)
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pregunta</Label>
                      <Textarea
                        value={currentQuestion.question}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                        }
                        placeholder="Escribe la pregunta..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Opciones</Label>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 text-center font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const updated = [...currentQuestion.options];
                              updated[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: updated });
                            }}
                            placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                          />
                          <Checkbox
                            checked={currentQuestion.correctAnswer === index}
                            onCheckedChange={() =>
                              setCurrentQuestion({ ...currentQuestion, correctAnswer: index })
                            }
                          />
                        </div>
                      ))}
                      <p className="text-sm text-muted-foreground">
                        Marca la casilla de la respuesta correcta
                      </p>
                    </div>

                    <Button type="button" onClick={addQuestion} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Pregunta
                    </Button>
                  </div>

                  {questions.length > 0 && (
                    <div className="space-y-2 border-t pt-4">
                      <Label>Preguntas Agregadas ({questions.length})</Label>
                      {questions.map((q, index) => (
                        <Card key={index}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-sm">
                                {index + 1}. {q.question}
                              </CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="text-xs space-y-1">
                              {q.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  {i === q.correctAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  )}
                                  <span>
                                    {String.fromCharCode(65 + i)}. {opt}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Tarea</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No hay tareas aún</h3>
                <p className="text-muted-foreground">
                  Crea tu primera tarea para comenzar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle>{assignment.title}</CardTitle>
                      <Badge className={getTypeColor(assignment.type)}>
                        {getTypeLabel(assignment.type)}
                      </Badge>
                      {assignment.isAutoGraded && (
                        <Badge variant="outline" className="bg-blue-50">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Auto-calificado
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{assignment.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/instructor/courses/${params.id}/assignments/${assignment.id}/submissions`)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Ver Envíos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment.id);
                        setIsRubricDialogOpen(true);
                      }}
                    >
                      <ListChecks className="mr-2 h-4 w-4" />
                      Rúbrica
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Puntuación: {assignment.maxScore} pts</span>
                  </div>
                  {assignment.dueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Vence: {format(new Date(assignment.dueDate), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{assignment.submissions.length} envíos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de Rúbrica */}
      <Dialog open={isRubricDialogOpen} onOpenChange={setIsRubricDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Rúbrica de Evaluación</DialogTitle>
            <DialogDescription>
              Define los criterios de calificación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {rubricCriteria.map((criterion, index) => (
              <Card key={index}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm">Criterio {index + 1}</CardTitle>
                    {rubricCriteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      value={criterion.name}
                      onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                      placeholder="Ej: Contenido"
                    />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={criterion.description}
                      onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                      placeholder="Describe qué evalúa este criterio"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Puntos</Label>
                    <Input
                      type="number"
                      value={criterion.points}
                      onChange={(e) => updateCriterion(index, 'points', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button type="button" onClick={addCriterion} variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Criterio
            </Button>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm">
                <span>Total de puntos:</span>
                <span className="font-bold">
                  {rubricCriteria.reduce((sum, c) => sum + c.points, 0)} pts
                </span>
              </div>
              {selectedAssignment && (
                <p className="text-xs text-muted-foreground mt-1">
                  Debe coincidir con{' '}
                  {assignments.find(a => a.id === selectedAssignment)?.maxScore} pts
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRubricDialogOpen(false);
                  setSelectedAssignment(null);
                  setRubricCriteria([{ name: '', description: '', points: 0 }]);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateRubric}>
                Crear Rúbrica
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
