
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  ListChecks, 
  MessageSquare, 
  User 
} from 'lucide-react';
import { SubmissionComments } from '@/components/submission-comments';

type Submission = {
  id: string;
  content: string | null;
  cloud_storage_path: string | null;
  answersData: any;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  user: {
    name: string;
    email: string;
  };
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  isAutoGraded: boolean;
  questionsData?: any[];
  course: {
    title: string;
  };
};

type Rubric = {
  id: string;
  criteriaData: Array<{
    name: string;
    description: string;
    points: number;
  }>;
};

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isRubricDialogOpen, setIsRubricDialogOpen] = useState(false);
  
  const [gradeData, setGradeData] = useState({
    score: 0,
    feedback: '',
  });

  const [rubricScores, setRubricScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'INSTRUCTOR') {
      router.push('/');
      return;
    }
    if (params.assignmentId) {
      fetchData();
    }
  }, [params.assignmentId, session, status, router]);

  const fetchData = async () => {
    try {
      // Obtener información de la tarea
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json();
        setAssignment(assignmentData);
      }

      // Obtener envíos
      const submissionsRes = await fetch(
        `/api/submissions?assignmentId=${params.assignmentId}`
      );
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData);
      }

      // Obtener rúbrica si existe
      const rubricRes = await fetch(
        `/api/rubrics?assignmentId=${params.assignmentId}`
      );
      if (rubricRes.ok) {
        const rubricData = await rubricRes.json();
        setRubric(rubricData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const openGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradeData({
      score: submission.score || 0,
      feedback: submission.feedback || '',
    });

    // Inicializar puntuaciones de rúbrica si existe
    if (rubric) {
      const initialScores: Record<number, number> = {};
      rubric.criteriaData.forEach((_, index) => {
        initialScores[index] = 0;
      });
      setRubricScores(initialScores);
    }

    setIsGradeDialogOpen(true);
  };

  const handleGradeWithRubric = () => {
    const totalScore = Object.values(rubricScores).reduce((sum, score) => sum + score, 0);
    setGradeData({ ...gradeData, score: totalScore });
    setIsRubricDialogOpen(false);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    if (gradeData.score < 0 || gradeData.score > (assignment?.maxScore || 100)) {
      toast.error(`La calificación debe estar entre 0 y ${assignment?.maxScore || 100}`);
      return;
    }

    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });

      if (res.ok) {
        toast.success('Calificación guardada exitosamente');
        setIsGradeDialogOpen(false);
        setSelectedSubmission(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al calificar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al calificar el envío');
    }
  };

  const handleDownloadFile = async (submission: Submission) => {
    if (!submission.cloud_storage_path) return;

    try {
      const res = await fetch(`/api/submissions/${submission.id}/download`);
      if (res.ok) {
        const data = await res.json();
        const a = document.createElement('a');
        a.href = data.url;
        a.target = '_blank';
        a.click();
      } else {
        toast.error('Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GRADED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Calificado
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Por calificar
          </Badge>
        );
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
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

  if (!assignment) {
    return null;
  }

  const gradedCount = submissions.filter((s) => s.status === 'GRADED').length;
  const submittedCount = submissions.filter((s) => s.status === 'SUBMITTED').length;

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        ← Volver
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-muted-foreground">{assignment.course.title}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Envíos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Por Calificar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{submittedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Calificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradedCount}</div>
          </CardContent>
        </Card>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-lg">No hay envíos aún</h3>
                <p className="text-muted-foreground">
                  Los estudiantes aún no han enviado sus tareas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <CardTitle className="text-lg">{submission.user.name}</CardTitle>
                    </div>
                    <CardDescription>{submission.user.email}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(submission.status)}
                    {submission.status === 'GRADED' && (
                      <Badge className="text-base px-3 py-1">
                        {submission.score}/{assignment.maxScore}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {submission.content && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Respuesta:</Label>
                    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                      {submission.content}
                    </p>
                  </div>
                )}

                {submission.cloud_storage_path && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Archivo Adjunto:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(submission)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Archivo
                    </Button>
                  </div>
                )}

                {assignment.isAutoGraded && submission.answersData && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Respuestas:</Label>
                    <div className="space-y-3">
                      {assignment.questionsData?.map((question, qIndex) => (
                        <div key={qIndex} className="border rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium">
                            {qIndex + 1}. {question.question}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Respuesta:</span>
                            <span
                              className={
                                submission.answersData[qIndex] === question.correctAnswer
                                  ? 'text-green-600 font-medium'
                                  : 'text-red-600 font-medium'
                              }
                            >
                              {String.fromCharCode(65 + submission.answersData[qIndex])}.{' '}
                              {question.options[submission.answersData[qIndex]]}
                            </span>
                            {submission.answersData[qIndex] === question.correctAnswer ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                (Correcta:{' '}
                                {String.fromCharCode(65 + question.correctAnswer)})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {submission.feedback && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Retroalimentación:</Label>
                    <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {submission.submittedAt && (
                    <span>
                      Enviado el{' '}
                      {format(
                        new Date(submission.submittedAt),
                        "d 'de' MMMM, yyyy 'a las' HH:mm",
                        { locale: es }
                      )}
                    </span>
                  )}
                  {submission.gradedAt && (
                    <span className="ml-4">
                      Calificado el{' '}
                      {format(
                        new Date(submission.gradedAt),
                        "d 'de' MMMM, yyyy 'a las' HH:mm",
                        { locale: es }
                      )}
                    </span>
                  )}
                </div>

                {!assignment.isAutoGraded && (
                  <Button
                    onClick={() => openGradeDialog(submission)}
                    variant={submission.status === 'GRADED' ? 'outline' : 'default'}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {submission.status === 'GRADED' ? 'Editar Calificación' : 'Calificar'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de Calificación */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Calificar Envío</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.user.name} - {selectedSubmission?.user.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="score">Calificación</Label>
                {rubric && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRubricDialogOpen(true)}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Usar Rúbrica
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Input
                  id="score"
                  type="number"
                  value={gradeData.score}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, score: parseFloat(e.target.value) })
                  }
                  min="0"
                  max={assignment?.maxScore || 100}
                  step="0.5"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  / {assignment?.maxScore} puntos
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Retroalimentación (opcional)</Label>
              <Textarea
                id="feedback"
                value={gradeData.feedback}
                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                rows={6}
                placeholder="Escribe comentarios para el estudiante..."
              />
            </div>

            {/* Sección de comentarios */}
            {selectedSubmission && (
              <div className="mt-6">
                <SubmissionComments submissionId={selectedSubmission.id} />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGradeDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleGradeSubmission}>Guardar Calificación</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Rúbrica */}
      <Dialog open={isRubricDialogOpen} onOpenChange={setIsRubricDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calificar con Rúbrica</DialogTitle>
            <DialogDescription>
              Asigna puntos a cada criterio
            </DialogDescription>
          </DialogHeader>

          {rubric && (
            <div className="space-y-4">
              {rubric.criteriaData.map((criterion, index) => (
                <Card key={index}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">{criterion.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {criterion.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={rubricScores[index] || 0}
                        onChange={(e) =>
                          setRubricScores({
                            ...rubricScores,
                            [index]: parseFloat(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max={criterion.points}
                        step="0.5"
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        / {criterion.points} pts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">
                    {Object.values(rubricScores).reduce((sum, score) => sum + score, 0)} /{' '}
                    {assignment?.maxScore} pts
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRubricDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleGradeWithRubric}>Aplicar Puntuación</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
